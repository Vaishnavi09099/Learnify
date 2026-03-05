import { API_PATHS } from "../utils/apiPaths.js";
import axiosInstance from "../utils/axiosInstance.js";

const getDocuments = async ()=>{
    try{
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.GET_DOCUMENTS)

        return response.data;

    }catch(err){
        throw new Error("Failed to fetch documents");
    }
}
const uploadDocument = async (formData)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD,formData,{
           headers:{
            'Content-Type':'multipart/form-data',
           }
        })

        return response.data;

    }catch(err){
        throw new Error("Failed to upload documnet");
    }
}

const deleteDocument = async(id)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id))
        return response.data;

    }catch(err){
        throw new Error("Failed to delete document!")

    }
}

const getDocumentById= async(id)=>{
    try{
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id));
        return response.data;

    }catch(err){
          throw new Error("Char response failed!")

    }
}




const authService = {
    getDocuments,getDocumentById,deleteDocument,uploadDocument,
}

export default documentService;