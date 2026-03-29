import Document from '../models/Document.js'
import FlashCard from '../models/FlashCard.js'
import Quiz from '../models/Quiz.js'
import ChatHistory from '../models/ChatHistory.js'
import * as geminiService from '../utils/geminiService.js'
import {findRelevantChunks} from '../utils/textChunker.js'
// import {generateFlashCards,generateQuiz,generateSummary,chat,explainConcept,getChatHistory} from '../controllers/aiController.js'


export const generateFlashCards =async  (req,res,next)=>{
    try{
        const{documentId,count=10} = req.body;
        if(!documentId){
            return res.status(400).json({
                success:false,
                message:"Please provide document Id"
            })
        }

        const document = await Document.findOne({
            _id:documentId,
            userId:req.user._id,
        
        })
        if(!document){
            return res.status(404).json({
                success:false,
                message:"Document not found!"
            })
        }

        const extractedText = typeof document.extractedText === "string" ? document.extractedText.trim() : "";
        if (!extractedText) {
            console.log("⚠️ generateFlashCards: empty extractedText", { documentId });
            return res.status(400).json({
                success: false,
                message: "Document has no extracted text to generate flashcards."
            });
        }

        const cards = await geminiService.generateFlashCards(
            extractedText,parseInt(count)
        )

        const flashcardset = await FlashCard.create({
            userId:req.user._id,
            documentId: document._id,
            cards:cards.map(card =>({
                question:card.question,
                answer:card.answer,
                difficulty:card.difficulty,
                reviewCount:0,
                isStarred:false
            }))
        });

        res.status(201).json({
            success:true,
            data:flashcardset,
            message:"Flashcards genrated successfully!"
        })


    }catch(err){
         res.status(400).json({
            success:false,
           
            message:"Error generating flashcards!"
        })

    }
    
}
export const generateQuiz= async (req,res,next)=>{
     try{
        const{documentId,numQuestions = 5,title} = req.body;
        if(!documentId){
            return res.status(400).json({
                success:false,
                message:"Please provide document Id"
            })
        }

        const document = await Document.findOne({
            _id:documentId,
            userId:req.user._id,
        
        })
        if(!document){
            return res.status(404).json({
                success:false,
                message:"Document not found!"
            })
        }

        const extractedText = typeof document.extractedText === "string" ? document.extractedText.trim() : "";
        if (!extractedText) {
            console.log("⚠️ generateQuiz: empty extractedText", { documentId });
            return res.status(400).json({
                success: false,
                message: "Document has no extracted text to generate a quiz."
            });
        }
        
        const questions = await geminiService.generateQuiz(
            extractedText,parseInt(numQuestions)
        )

        const quiz = await Quiz.create({
            userId:req.user._id,
            documentId: document._id,
            title:title||`${document.title}-Quiz`,
            questions:questions,
            totalQuestions:questions.length,
            userAnswers:[],
            score:0

            })
    

        res.status(201).json({
            success:true,
            data:quiz,
            message:"Quiz genrated successfully!"
        })


    }catch(err){
         res.status(400).json({
            success:false,
           
            message:"Error generating Quiz!"
        })

    }




}
export const generateSummary = async (req,res,next)=>{
      try{
        const{documentId} = req.body;
        if(!documentId){
            return res.status(400).json({
                success:false,
                message:"Please provide document Id"
            })
        }

        const document = await Document.findOne({
            _id:documentId,
            userId:req.user._id,
        
        })
        if(!document){
            return res.status(404).json({
                success:false,
                message:"Document not found!"
            })
        }

        const extractedText = typeof document.extractedText === "string" ? document.extractedText.trim() : "";
        if (!extractedText) {
            console.log("⚠️ generateSummary: empty extractedText", { documentId });
            return res.status(400).json({
                success: false,
                message: "Document has no extracted text to generate a summary."
            });
        }
        
        const summary = await geminiService.generateSummary(
            extractedText)


        res.status(200).json({
            success:true,
            data:{
                documentId:document._id,
                title:document.title,
                summary
            },
            message:"Summary genrated successfully!"
        })


    }catch(err){
         res.status(400).json({
            success:false,
           
            message:"Error generating Quiz!"
        })

    }

}
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;
        if (!documentId || !question || !String(question).trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide document Id and question"
            });
        }

       const document = await Document.findOne({
    _id: documentId,
    userId: req.user._id,
}).lean();

// ✅ PEHLE null check
if (!document) {
    return res.status(404).json({
        success: false,
        message: "Document not found!"
    });
}

// ✅ PHIR status check
if (document.status !== 'ready') {
    return res.status(400).json({
        success: false,
        message: "Document is still processing. Please wait."
    });
}

        const hasText = typeof document.extractedText === "string" && document.extractedText.trim().length > 0;
        const hasChunks = Array.isArray(document.chunks) && document.chunks.length > 0;
        if (!hasText && !hasChunks) {
            console.log("⚠️ Chat aborted: document has no extracted text/chunks", {
                documentId,
                extractedTextLen: document.extractedText?.length,
                chunksLen: document.chunks?.length
            });
            return res.status(400).json({
                success: false,
                message: "Document has no extracted text to answer from yet."
            });
        }

        
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        let contextChunks = relevantChunks;

if (!contextChunks || contextChunks.length === 0) {
    console.log("⚠️ No relevant chunks found, using full text fallback");

    contextChunks = [{
        // `geminiService.chatWithContext` expects `content`, not `text`.
        content: document.extractedText || "No content available"
    }];
}

        const contextPreviewLen = contextChunks?.[0]?.content?.toString()?.trim()?.length ?? 0;
        console.log("🧠 chat context build", {
            questionPreview: String(question).slice(0, 80),
            relevantChunksLen: relevantChunks?.length ?? 0,
            contextChunksLen: contextChunks?.length ?? 0,
            firstChunkContentLen: contextPreviewLen
        });

        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }

        // const answer = await geminiService.chatWithContext(question, relevantChunks);
        const answer = await geminiService.chatWithContext(question, contextChunks);
        
        chatHistory.messages.push({
            role: 'user',
            content: question,
            timestamp: new Date(),
            relevantChunks: []
        }, {
            role: 'assistant',
            content: answer,
            timestamp: new Date(),
            relevantChunks: chunkIndices
        });
        
        await chatHistory.save();

        res.status(201).json({
            success: true,
            data: {
                question, answer, relevantChunks: chunkIndices, chatHistoryId: chatHistory._id
            },
            message: "Response generated successfully!"
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Error generating Response!"
        });
    }
}
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;
        if (!documentId || !concept || !String(concept).trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide document Id and concept"
            })
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
        })
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found!"
            })
        }

        const extractedText = typeof document.extractedText === "string" ? document.extractedText.trim() : "";
        if (!extractedText) {
            console.log("⚠️ explainConcept: empty extractedText", { documentId });
            return res.status(400).json({
                success: false,
                message: "Document has no extracted text to explain concepts."
            });
        }

        // ✅ chunks ki jagah extractedText use karo
        const explanation = await geminiService.explainConcept(concept, extractedText);

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
            },
            message: "Explanation generated successfully!"
        })

    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Error generating explanation!"
        })
    }
}

export const getChatHistory = async (req,res,next)=>{
     try{
        const{documentId} = req.params;
        if(!documentId ){
            return res.status(400).json({
                success:false,
                message:"Please provide document Id and concept"
            })
        }

        const chatHistory = await ChatHistory.findOne({
            userId:req.user._id,
            documentId
        
        }).select("messages")

        if(!chatHistory){
            return res.status(200).json({
                success:true,
                data:[],
                message:"No chat history found for this document!"
            })
        }
        

        res.status(200).json({
            success:true,
            data:chatHistory.messages,
            message:"chathistory retrieved successfully!"
        })


    }catch(err){
         res.status(400).json({
            success:false,
           
            message:"Error generating chatHistry!"
        })

    }
   

}