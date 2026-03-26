import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import fetch from 'node-fetch';

export const extractTextFromPDF = async (filePath) => {
    try {
        let buffer;

        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            const response = await fetch(filePath, {
                headers: {
                    'Accept': 'application/pdf,*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch PDF from URL: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            const fs = await import('fs/promises');
            buffer = await fs.readFile(filePath);
        }

        const data = await pdfParse(buffer);
        
        console.log("✅ PDF parsed successfully, text length:", data.text?.length);
        
        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info
        };

    } catch (err) {
        console.log("❌ PDF parsing error:", err.message);
        throw new Error("Failed to extract text from PDF");
    }
}