import { FileText, Plus, Trash2, Upload, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import documentService from '../../services/documentService'
import { ClipLoader } from "react-spinners";
import DocumentCard from './DocumentCard.jsx';
import AppLayout from '../../components/layout/AppLayout';



const DocumentListPage = () => {
  const fileInputRef = useRef(null);
  const[documents,setDocuments] = useState([]);
  const[loading,setLoading] = useState(true);
  const[isUploadModalOpen,setIsUploadModalOpen] = useState(false);
  const[uploadFile,setUploadFile]=useState(null);
  const[uploadTitle,setUploadTitle] = useState("");
  const[uploading,setUploading] = useState(false);

  const[isDeleteModalOpen,setIsDeleteModalOpen] = useState(false);
  const[deleting,setDeleting]=useState(false);
  const[selectedDoc,setSelectedDoc]=useState(null);

  const fetchDocuments =async ()=>{
    try{
      const data = await documentService.getDocuments();
      setDocuments(data.data || []);
    }catch(err){
      toast.error("failed to fetch documnets");
      console.log(err);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchDocuments();
  },[])

  const handleFileChange = (e)=>{
    const file = e.target.files[0];
    if(file){
      setUploadFile(file);
      setUploadTitle(file.name.split(".")[0])
    }
  };

  const handleUpload = async (e)=>{
    e.preventDefault();
    if(!uploadFile || !uploadTitle){
      toast.error("Please provide a title and select a file!");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file",uploadFile);
    formData.append("title",uploadTitle);

    try{
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded succesfully");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocuments();

    }catch(error){
      toast.error(error.message || "Upload failed.");
    }finally{
      setUploading(false);
    }
  }

  const handleDeletRequest = (doc)=>{
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  }
  
  const handleConfirmDelete = async ()=>{
    if(!selectedDoc) return;
    setDeleting(true);
    try{
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`'${selectedDoc.title}' deletd.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((d)=>d._id !== selectedDoc._id));
    }catch(err){
      toast.error(err.message || "Failed to delete document.");
    }finally{
      setDeleting(false);
    }
  }

  const renderContent = ()=>{
     if(loading){
      return <ClipLoader color="#00d492" size={24} />;
      
    }
    
    if(documents.length===0){
      return(
        
           <div className='flex items-center mt-20 flex-col justify-center'>
          <div className='rounded-xl text-gray-600/80 p-4 mb-5 shadow-md bg-gray-300/50'>
            <FileText size={30} />
          </div>
          <p className='font-semibold text-lg '>No Documents Yet</p>
          <p className='text-gray-600 font-semibold/80 mb-5'>Get started by uploading your first PDF document to begin learning.</p>
            <div onClick={()=>setIsUploadModalOpen(true)}  className='flex  items-center p-3 shadow-md  bg-green-600/80  hover:-translate-y-1 transition-all ease-in-out  duration-300 cursor-pointer border-none text-white font-bold rounded-xl p-2'>
            <Plus />
            <p>Upload Document</p>

          </div>
       </div>

      )
    }

    return (
     
      <div className='flex'>
        {documents.map((doc)=>(
          <DocumentCard document ={doc} onDelete={handleDeletRequest}
        >
  </DocumentCard>
        ))}
      </div>
    )


  }

  
  return (

    <AppLayout>
      <div className='flex justify-between p-2 m-4 ml-10 '>
        <div >
          <p className='font-semibold text-3xl mb-2'>My Documents</p>
          <p className='text-gray-500/70 font-semibold'>Manage and organize your learning materials</p>
</div>


   <div onClick={()=>setIsUploadModalOpen(true)} className=' p-2 mr-10 cursor-pointer'>
          <div  className='flex items-center p-3 shadow-md  bg-green-600/80 border-none text-white font-bold rounded-xl p-2'>
            <Plus />
            <p>Upload Document</p>

          </div>
         </div>
    </div>
 
<div>
{renderContent()}
</div>



{isUploadModalOpen && (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm'>
  <div className=' w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60  rounded-2xl shadow-2xl shadow-slate-900/20 p-4'>
  <div className='flex justify-between p-2'>
     <div>
    <p className='font-semibold text-2xl mb-2'>Upload New Document</p>
    <p className='font-semibold text-gray-700/90'>Add a PDF document to your library</p>

   </div>
 
   <div className='text-gray-700/80 '>
   <button onClick={()=>setIsUploadModalOpen(false)}>
      <X />
    </button>
 </div>

  </div>

      <form onSubmit={handleUpload}>
     <div className='flex flex-col p-2'>
        <label className='uppercase font-semibold mb-2 text-sm text-gray-900 '>
          Document title
        </label>
        <input
        type='text'
        value={uploadTitle}
        onChange={(e)=>setUploadTitle(e.target.value)}
        required
        className='border border-gray-700/40 rounded-md shadow-sm text-xs px-3 py-2'
        placeholder='eg.React interview prep'
          />
        
      </div >
      <div className='p-2 '>
        <label className='uppercase font-semibold  text-sm text-gray-900 '>
          Pdf file
        </label>

        <div onClick={()=>fileInputRef.current.click()} className=' border-2 border-dashed shadow-sm p-10 mt-3 border-gray-700/40 rounded-xl '>
          <input
           type="file"
           ref={fileInputRef}

          className='hidden'
          onChange={handleFileChange}
          accept='.pdf' 
          />

          <div className='flex flex-col justify-center items-center '>
            <div className=' rounded-xl p-3 bg-green-400/30 text-green-700 shadow-md  '>
              <Upload size={26}/>


            </div>



            <p className='font-semibold mt-5'>{uploadFile ? (
              <span>{uploadFile.name}</span>
            ):(
              <>
              <span className='text-green-700 mr-1'>
                Click to upload
              </span>
              or drag and drop
              
              </>
            )}</p>

            <p className='text-gray-600/70 font-semibold'>PDF upto 10MB</p>
          </div>
        </div>
      </div>



      <div className='flex gap-4 p-2 mt-4'>
        <div className='bg-white shadow-sm flex-1 py-2 rounded-xl text-center  font-semibold border-gray-300 border border-2'>
           <button
        type='button'
        onClick={()=>setIsUploadModalOpen(false)}
        disabled={uploading}
        className=''
        >
          Cancel

        </button>

        </div>

        <div  className='bg-green-600/80 shadow-md flex-1 py-2 rounded-xl text-center  text-white font-semibold  '>
            <button
        type='submit'
        disabled={uploading}
        className=''>
          {uploading ?(
            <span>
              <div />
                Uplaoding.....
              
            </span>
          ):(
            "Upload"
          
          )}

        </button>

        </div>
       
      
      </div>
    </form>
  </div>

  </div>
)}



{isDeleteModalOpen &&(
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm'>
  <div className=' w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60  rounded-2xl shadow-2xl shadow-slate-900/20 p-6'>

  
    <div className='flex justify-between p-2'>
      <div className=' p-2 rounded-xl bg-red-500/40 text-red-900 shadow-md '>
        <Trash2 />
      </div>
     <div className='text-gray-700/80 '>
   <button onClick={()=>setIsDeleteModalOpen(false)}>
      <X />
    </button>
 </div>
    </div>

    <p className='font-semibold text-2xl p-2'>Confirm Deletion</p>
     <p className='p-2 font-semibold text-gray-700/90'>Are you sure you want to delete the document:{" "}
<span className='font-bold text-black'>{selectedDoc?.title}</span>
? This action cannot be undone.
     
    </p>


    <div className='flex gap-4 p-2 mt-4'>
      <div className='bg-white shadow-sm flex-1 py-2 rounded-xl text-center  font-semibold border-gray-300 border border-2'>
         <button type="button" onClick={()=>setIsDeleteModalOpen(false)} disabled={deleting} className=''>
         Cancel
      </button>


      </div>
      <div className='bg-red-600/90 shadow-sm flex-1 py-2 rounded-xl text-center  font-semibold border-gray-300 text-white'>
          <button 
      onClick={handleConfirmDelete}
      disabled={deleting}
      className=''>
        {deleting ?(
          <span>
            <div>
              Deleting....
            </div>
          </span>
        ):("Delete")}

      </button>


      </div>
     
     
      </div>

    

 





  

    {/* <div>
      


    <div>
      <button type="button" onClick={()=>setIsDeleteModalOpen(false)} disabled={deleting} className=''>
         Cancel
      </button>
      <button 
      onClick={handleConfirmDelete}
      disabled={deleting}
      className=''>
        {deleting ?(
          <span>
            <div>
              Deleting....
            </div>
          </span>
        ):("Delete")}

      </button> */}
    
    </div>
  </div>


)}
  

 </AppLayout>
 )

}

export default DocumentListPage