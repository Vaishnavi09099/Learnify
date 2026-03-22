import { API_PATHS } from "../utils/apiPaths.js";
import axiosInstance from "../utils/axiosInstance.js";

const genrateFlashcards = async (documentId , options)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS,{
           documentId,...options
        })

        return response.data;

    }catch(err){
        throw new Error("Failed to generate flashcards");
    }
}
const generateQuiz = async (documentId , options)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ,{
           documentId,...options
        })

        return response.data;

    }catch(err){
        throw new Error("Failed to generate QUIZ");
    }
}

const generateSummary = async(documentId)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY,{
           documentId
        })
        return response.data;

    }catch(err){
        throw new Error("Failed to generate summary!")

    }
}

const chat = async(documentId,message)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.CHAT,{
            documentId,question:message
        });
        return response.data;

    }catch(err){
          throw new Error("Char response failed!")

    }
}
const explainConcept = async(documentId,concept)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT,{documentId,concept});
        return response.data;

    }catch(err){
          throw new Error("Failed to explain concept!")

    }
}
const getChatHistory = async(documentId)=>{
    try{
        const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
        return response.data;

    }catch(err){
          throw new Error("Failed to fetch chat history!")

    }
}



const aiService = {
    genrateFlashcards,getChatHistory,explainConcept,chat,generateSummary,generateQuiz 
}

export default aiService;