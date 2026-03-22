import fs from 'node:fs';
import { PDFParse } from 'pdf-parse';
const { readFile } = fs.promises;


 export const extractTextFromPDF = async(filePath)=>{
    try{

        const buffer =await readFile(filePath);
        const parser = new PDFParse({data:buffer});
        const data = await parser.getText();
        return{
            text:data.text,
            numPages:data.numPages,
            info:data.info
        }

    }catch(err){
        console.log("PDF parsing error",err);
        throw new Error("Failed to extract text from PDF");

    }
}

