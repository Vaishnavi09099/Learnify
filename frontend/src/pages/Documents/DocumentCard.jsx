import { BookOpen, BrainCircuit, Clock, FileText, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import moment from "moment";


const formatFileSize = (bytes)=>{
    if(bytes<1024){
        return bytes+" B";
    }
    if(bytes<1024*1024){
        return (bytes/1024).toFixed(1)+" KB";
    }
    if(bytes<1024*1024*1024){
        return (bytes/1024/1024).toFixed(1)+" MB";
    }

}
const DocumentCard = ({document,onDelete}) => {
    const navigate = useNavigate();
 const handleNavigate = ()=>{
    navigate(`/documents/${document._id}`);
 };

 const handleDelete = (e)=>{
    e.stopPropagation();
    onDelete(document);
 }

 const [isHovered,setIsHovered]=useState(false);

 return(
   
         <div onClick={()=>navigate(`/documents/${document._id}`)} onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)} className=' bg-white group cursor-pointer hover:shadow-lg hover:bg-green-100/20 hover:-translate-y-1 transition-all border border-transparent hover:border-green-300/30 duration-300 px-6 py-6 m-10 rounded-xl  '>
        <div className='flex justify-between items-center'>
            <div className='bg-green-600/80 p-2 text-white font-bold rounded-xl  shadow-md mb-4'>
                 <FileText />

            </div>
            {isHovered &&(
                 <div onClick= {(e)=>{e.stopPropagation(); handleDelete(e)}} className='text-red-500 font-semibold shadow-md rounded-md p-2 bg-red-200'>
                 <Trash2 size={20} />

            </div>

            )}
           
           
        </div>
        <p className='font-semibold mb-1'>{document.title}</p>
         <div className='font-semibold text-gray-500 mb-5 text-xs'>
             {document.fileSize !== undefined && (
                 <>
                 <span>{formatFileSize(document.fileSize)}</span>
                
                 </>
             )}
         </div>

                 <div className='flex gap-2'>
            {document.flashcardCount !== undefined && (
                <div className='flex  px-2 py-1  rounded-md text-pink-800 font-semibold bg-pink-800/10 justify-center items-center gap-1'>
                    <BookOpen size={15}/>
                    <span className='text-sm'>{document.flashcardCount}FlashCards</span>
                </div>
            )}
            {document.quizCount!==undefined &&(
                <div className='flex  px-2 py-1  rounded-md text-green-800 font-semibold bg-green-800/10 justify-center items-center gap-1'>
                    <BrainCircuit size={15}/>
                    <span className='text-sm'>{document.quizCount}Quizzes</span>
                </div>
            )}
        </div>
        <hr className='text-gray-500/20 mt-6 mb-3'></hr>
       

     <div>
         <div className='flex text-gray-500 font-semibold items-center gap-1'>
             <Clock  size={12} />
             <span className='text-xs '>Uploaded {moment(document.createdAt).fromNow()}</span>
         </div>
     </div>
 </div>

   
   

 )

}

export default DocumentCard;