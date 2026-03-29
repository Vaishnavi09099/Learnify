import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseLib = require('pdf-parse');
const pdfParse = pdfParseLib.default || pdfParseLib;
import fetch from 'node-fetch';

export const extractTextFromPDF = async (input) => {
    try {
        let buffer;

       
        if (Buffer.isBuffer(input)) {
            buffer = input;
        } else if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
            const response = await fetch(input);
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else if (typeof input === 'string') {
            const fs = await import('fs/promises');
            buffer = await fs.readFile(input);
        } else {
            throw new Error("Invalid input: expected Buffer, URL, or file path");
        }

        const data = await pdfParse(buffer);
        console.log("✅ PDF parsed, length:", data.text?.length);

        return {
            text: data.text,
            numPages: data.numpages
        };

    } catch (err) {
        console.log("❌ PDF parsing error:", err.message);
        throw new Error("Failed to extract text from PDF");
    }
};