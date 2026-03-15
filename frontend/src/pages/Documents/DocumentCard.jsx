import { BookOpen, BrainCircuit, Clock, FileText, Trash2 } from 'lucide-react'
import React from 'react'
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

 return <div className='group relative' onClick={handleNavigate}>
    <div>
        <div>
            <div>
                <FileText />
            </div>
            <button onClick={handleDelete}>
                <Trash2 />

            </button>
        </div>
        <h3 title={document.title}>
            {document.title}
        </h3>

        <div>
            {document.fileSize !== undefined && (
                <>
                <span>{formatFileSize(document.fileSize)}</span>
                
                </>
            )}
        </div>

        <div>
            {document.flashcardCount !== undefined && (
                <div>
                    <BookOpen />
                    <span>FlashCards</span>
                </div>
            )}
            {document.quizCount!==undefined &&(
                <div>
                    <BrainCircuit />
                    <span>{document.quizCount}Quizzes</span>
                </div>
            )}
        </div>


    </div>

    <div>
        <div>
            <Clock />
            <span>Uploaded {moment(document.createdAt).fromNow()}</span>
        </div>
    </div>

   

 </div>
}

export default DocumentCard