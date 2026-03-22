import { API_PATHS } from "../utils/apiPaths.js";
import axiosInstance from "../utils/axiosInstance.js";

const login = async (email , password)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
            email,
            password
        })

        return response.data;

    }catch(err){
    throw new Error(err.response?.data?.message || "Login failed! Please try again");
}

}

const register = async(username,email,password)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER,{
            username,email,password
        })
        return response.data;

    }catch(err){
    throw new Error(err.response?.data?.message || "Login failed! Please try again");
}

}

const getProfile = async()=>{
    try{
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
       console.log("getProfile response:", response.data);
        return response.data;

    }catch(err){
         console.log("getProfile error:", err.response);
    throw new Error(err.response?.data?.message || "Login failed! Please try again");
}

}
const updateProfile = async(userData)=>{
    try{
        const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE,userData);
        return response.data;

    }catch(err){
    throw new Error(err.response?.data?.message || "Login failed! Please try again");
}

}
const changePassword = async(passwords)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD,passwords);
        return response.data;

    }catch(err){
    throw new Error(err.response?.data?.message || "Login failed! Please try again");
}

}



const authService = {
    login,register,getProfile,updateProfile,changePassword
}

export default authService;