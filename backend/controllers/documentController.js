import fs from 'fs/promises';
import mongoose from 'mongoose';                         
import Document from '../models/Document.js';            
import FlashCard from '../models/FlashCard.js';          
import Quiz from '../models/Quiz.js';                    
import { extractTextFromPDF } from "../utils/pdfParser.js";
import chunkText from "../utils/textChunker.js";

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF file",
            });
        }

        const { title } = req.body;
        if (!title) {
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Please provide a document title"
            });
        }

        const baseUrl = `http://localhost:${process.env.PORT || 5000}`; 
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        const document = await Document.create({
            userId: req.user?._id,
            title,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            status: 'processing'   
        });

        processPDF(document._id, req.file.path).catch(err => {
            console.log("PDF processing error: ", err);
        });

        return res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded successfully. Processing in progress"
        });

    } catch (err) {
        console.error("Upload error:", err);  
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        return res.status(500).json({
            success: false,
            message: "PDF upload failed!",
            error: err.message    
        });
    }
};

const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);
         console.log("Text length:", text?.length);
        const chunks = chunkText(text, 500, 50);
        console.log("Chunks type:", typeof chunks);  
        console.log("Chunks length:", chunks?.length);
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready',
        });
        console.log(`Document ${documentId} processed successfully`);

    } catch (err) {
        console.log(`Error processing document ${documentId}:`, err);
        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: 'flashcardsets',   
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' }, 
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (err) {
        console.error("getDocuments error:", err);   
        return res.status(500).json({
            success: false,
            message: "Error fetching documents!",
            error: err.message
        });
    }
};

export const getDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        const flashcardCount = await FlashCard.countDocuments({
            documentId: document._id,
            userId: req.user._id
        });
        const quizCount = await Quiz.countDocuments({
            documentId: document._id,
            userId: req.user._id
        });

        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;  
        documentData.quizCount = quizCount;

        return res.status(200).json({
            success: true,
            data: documentData
        });

    } catch (err) {
        console.error("getDocument error:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching this document!",
            error: err.message
        });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        await fs.unlink(document.filePath).catch(() => {
            console.log("File already deleted or not found");
        });

        await document.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });

    } catch (err) {
        console.error("deleteDocument error:", err);
        return res.status(500).json({
            success: false,
            message: "Error deleting document",
            error: err.message
        });
    }
};

