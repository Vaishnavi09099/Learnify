import React, { useEffect, useState } from 'react'
import progressService from '../../services/progressService'
import toast from 'react-hot-toast'
import {FileText,BookOpen,BrainCircuit,TrendingUp,Clock} from 'lucide-react'
import { ClipLoader } from "react-spinners";
import AppLayout from '../../components/layout/AppLayout';

{/*  */}

const DashboardPage = () => {
  const [dashboardData,setDashboardData]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const fetchDashboardData = async()=>{
      try{
        const data = await progressService.getDashboardData();
        console.log("Data___getDashboardData",data);
        setDashboardData(data.data);
      }catch(err){
        toast.error("Failed to fetch dashboard data.");
        console.log(err);
      }finally{
        setLoading(false);
      }
    };
    fetchDashboardData();
  },[]);

  if(loading){
    return <ClipLoader color="#00d492" size={24} />;
    
  }

  if(!dashboardData){
    return(
      
   <div className='min-h-screen bg-gray-200 flex justify-center  items-center'>
        <div>
          <div>
            <TrendingUp />

          </div>
          <p>No dashboard data available.</p>
        </div>
      </div>



     
    );


  }

  const stats = [{
    label:'Total Documents',
    value:dashboardData.overview.totalDocuments,
    icon:FileText,

  },
{
  label:'Total Flashcards',
    value:dashboardData.overview.totalFlashcards,
    icon:BookOpen,


},{
  label:'Total Quizzes',
    value:dashboardData.overview.totalQuizzes,
    icon:BrainCircuit,

}]
  return (
    <AppLayout>
        <div>DashboardPage</div>

    </AppLayout>
  
  )
}

export default DashboardPage