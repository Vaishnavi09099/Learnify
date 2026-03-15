import { extractTextFromPDF } from "../utils/pdfParser.js";
import chunkText from "../utils/textChunker.js";
import fs from 'fs/promises';

export const uploadDocument = async(req , res , next, )=>{
    try{
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"Please upload a PDF file",

            })
        }
        const {title} = req.body;
        if(!title){
            await FileSystem.unlink(req.file.path);
            return res.status(400).json({
                success:false,
                message:"Please provide a document title"
            })
        }

        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/upload/documents/${req.file.filename}`;

        const document = await Document.create({
            userId:req.user._id,
            title,
            fileName: req.file.originalname,
            filePath:fileUrl,
            fileSize:req.file.size,
            status:"Processing"
            
        });

        processPDF(document._id,req.file.path).catch(err=>{
            console.log("PDF processing error: ",err)
        });



        res.status(201).json({
            success:true,
            data:document,
            message:"Document uploaded successfully.Processing in progress"
        })

    }catch(err){
        if(req.file){
            await fs.unlink(req.file.path)
        }
        return res.json(500).json({
            success:false,
            message:"Pdf not able to upload!Faah!"
        })
        
    }

}

const processPDF = async (documentId,filePath)=>{
    try{
        const {text} = await extractTextFromPDF(filePath);
        const chunks = chunkText(text,500,50);
        await Document.findByIdandUpdate(documentId,{
            extractedText:text,
            chunks:chunks,
            status:'ready',
        })
        console.log(`Document ${documentId} processed successfully`);

    }catch(err){
        console.log(`Error processing document ${documentId}:`,err);
        await Document.findByIdandUpdate(documentId,{
            status:'failed'
        })

    }
}

export const getDocuments = async(req , res , next, )=>{
    try{
        const documents = await Document.aggregate([
            {
                $match:{userId:new mongoose.Types.ObjectId(req.user._id)}

            },
            {
                $lookup:{
                    from:'flashcard',
                    localField:'_id',
                    foreignField:'documentId',
                    as:'flashcardSets'

                }
            },
            {
                $lookup:{
                    from:'quizzes',
                    localField:'_id',
                    foreignField:'documentId',
                    as:'quizzes'

                }
            },
            {
                $addField:{
                    flashcarCount:{$size:'$flashcardSets'},
                    quizCount:{$size:'$quizzes'}
                }
            },
            {
                $project:{
                    extractedText:0,
                    chunks:0,
                    flashcardSets:0,
                    quizzes:0
                }
            },
            {
                $sort:{uploadDate:-1}
            }

        ])
        return res.status(200).json({
            success:true,
            count:documents.length,
            data:documents
        })


    }catch(err){
         return res.status(500).json({
            success:false,
            message:"Error fetching documnts!"
        })


    }

}
export const getDocument = async(req , res , next, )=>{
    try{
        const document = await Document.findOne({
            _id:req.params.id,
            userId:req.user._id
        });

        if(!document){
            return res.status(404).json({
                success:false,
                message:"Document not found",
            })
        }

        const flashcarCount = await FlashCard.countDocuments({documentId: document._id,userId:req.user._id})
        const quizCount = await Quiz.countDocuments({documentId: document._id,userId:req.user._id});

        
        const documentData = document.toObject();
        documentData.flashcarCount = flashcarCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success:true,
            data:documentData  
              })


    }catch(err){
         res.status(500).json({
            success:false,
            message:"Error fetching this docs!"
              })

    }

}
export const deleteDocument = async(req , res , next, )=>{
    try{
        const document = await Document.findOne({
            _id:req.params.id,
            userId:req.user._id
        });

        if(!document){
            return res.status(404).json({
                success:false,
                message:"Document not found",
            })
        }

        await fs.unlink(document.filePath);

        await document.deleteOne();
        return res.status(200).json({
            success:true,
            message:"Document deleted successfully"
        })


    }catch(err){
         return res.status(500).json({
            success:false,
            message:"error deleting document"
        })

    }

}

