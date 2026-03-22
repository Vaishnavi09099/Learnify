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

        const cards = await geminiService.generateFlashCards(
            document.extractedText,parseInt(count)
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
        
        const questions = await geminiService.generateQuiz(
            document.extractedText,parseInt(numQuestions)
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
        
        const summary = await geminiService.generateSummary(
            document.extractedText)


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
        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                message: "Please provide document Id and question"
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
        }).lean(); 
        if (!document) { 
             return res.status(404).json({
                success: false,
                message: "Document not found!"
            });
        }

        
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

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

        const answer = await geminiService.chatWithContext(question, relevantChunks);
        
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
export const explainConcept = async (req,res,next)=>{
      try{
        const{documentId,concept} = req.body;
        if(!documentId || !concept){
            return res.status(400).json({
                success:false,
                message:"Please provide document Id and concept"
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
        
        const relevantChunks = findRelevantChunks(document.chunks,concept,3);
         const context = relevantChunks.map(c=>c.content).join("\n\n")

        const explanation = await geminiService.explainConcept(concept,context);


        res.status(200).json({
            success:true,
            data:{
               concept,
               explanation,
               relevantChunks:relevantChunks.map(c=>c.chunkIndex)
            },
            message:"Explanation genrated successfully!"
        })


    }catch(err){
         res.status(400).json({
            success:false,
           
            message:"Error generating explanation!"
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