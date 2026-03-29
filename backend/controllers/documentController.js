import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import Document from '../models/Document.js';
import FlashCard from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from "../utils/pdfParser.js";
import chunkText from "../utils/textChunker.js";
import fs from "fs";

export const processPDF = async (documentId, buffer) => {
    try {
        console.log("📦 BUFFER SIZE:", buffer?.length);

        if (!buffer || buffer.length === 0) {
            throw new Error("Buffer empty");
        }

        const result = await extractTextFromPDF(buffer);

        console.log("📄 RAW RESULT:", result?.text?.slice(0, 200));

        const text = result?.text?.trim() || "";

        console.log("📏 TEXT LENGTH:", text.length);

        if (!text || text.length < 50) {
            throw new Error("PDF text extraction failed");
        }

        const chunks = chunkText(text, 500, 50);

        console.log("🧩 CHUNKS:", chunks.length);

        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks,
            status: "ready",
        });

        console.log("✅ SAVED SUCCESSFULLY");

    } catch (err) {
        console.log("❌ ERROR:", err.message);

        await Document.findByIdAndUpdate(documentId, {
            status: "failed",
        });
    }
};

// ✅ UPLOAD DOCUMENT
// ✅ UPLOAD DOCUMENT
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
            return res.status(400).json({
                success: false,
                message: "Please provide a document title"
            });
        }

        // ✅ BUFFER (IMPORTANT 🔥)
        const buffer = req.file.buffer;

        console.log("📦 Buffer received, size:", buffer.length);

        // ✅ Create document (NO localPath now ❌)
       const document = await Document.create({
    userId: req.user?._id,
    title,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    filePath: "pending",  // ✅ placeholder, baad mein cloudinary URL se update hoga
    status: 'processing'
});

        // ✅ 1. PROCESS PDF (buffer se)
        await processPDF(document._id, buffer);

        // ✅ 2. Upload to Cloudinary (buffer se)
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",
                    folder: "cognify-uploads"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            stream.end(buffer);
        });

        console.log("☁️ Cloudinary URL:", uploadResult.secure_url);

        // ✅ 3. Save Cloudinary URL
       // ✅ 3. Save Cloudinary URL
await Document.findByIdAndUpdate(document._id, {
    cloudinaryUrl: uploadResult.secure_url,
    filePath: uploadResult.secure_url  // ✅ ADD THIS LINE
});

        return res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded & processed successfully"
        });

    } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({
            success: false,
            message: "PDF upload failed!",
            error: err.message
        });
    }
};

// ✅ PROCESS PDF


// ✅ GET ALL DOCUMENTS
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

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (err) {
        console.error("getDocuments error:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching documents!"
        });
    }
};



// ✅ GET SINGLE DOCUMENT
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

        res.status(200).json({
            success: true,
            data: documentData
        });

    } catch (err) {
        console.error("getDocument error:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching document!"
        });
    }
};



// ✅ DELETE DOCUMENT
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

        // ☁️ delete from cloudinary (if exists)
        if (document.cloudinaryUrl) {
            try {
                const publicId = document.cloudinaryUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            } catch (err) {
                console.log("Cloudinary delete error:", err.message);
            }
        }

        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });

    } catch (err) {
        console.error("deleteDocument error:", err);
        res.status(500).json({
            success: false,
            message: "Error deleting document"
        });
    }
};