import { API_PATHS } from "../utils/apiPaths.js";
import axiosInstance from "../utils/axiosInstance.js";

const getDashboardData = async ()=>{
    try{
        const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD)

        return response.data;

    }catch(err){
        throw new Error("Failed to fetch dashboard data");
    }
}





const progressService = {
     getDashboardData
}

export default progressService;