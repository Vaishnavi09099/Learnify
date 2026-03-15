import { FileText, Plus, Trash2, Upload, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import documentService from '../../services/documentService'
import { ClipLoader } from "react-spinners";
import DocumentCard from './DocumentCard';


const DocumentListPage = () => {
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
      setDocuments(data);
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
        
       <div>
        <div>
          <div>
            <FileText />

           
          </div>
          <h3>No documents yet</h3>
          <p>Get starete dby uploading your first documnet pdf to begin leraning </p>
          <button onClick={()=>setIsUploadModalOpen(true)}>
            <Plus />
            Upload Documnet
          </button>


        </div>
       </div>
      )
    }

    return (
      <div>
        {documents?.map((doc)=>(
          <DocumentCard document ={doc} onDelete={handleDeletRequest}
          
          
          >

          </DocumentCard>
        ))}
      </div>
    )


  }

  
  return (
<div>
  <div>
<div>
  <h1>My documents</h1>
  <p>Manage and organize your learning materials</p>
</div>
{documents.length>0 &&(
  <button onClick={()=>setIsUploadModalOpen(true)}>
  <Plus />
  Upload Documnet 
  </button>
  
)}
</div>
<div>
{renderContent()}
</div>

{isUploadModalOpen && (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm'>
  <div className='relatie w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-4'>
    <button onClick={()=>setIsUploadModalOpen(false)}>
      <X />
    </button>

    <div>
      <h2>
        Upload New document
      </h2>
      <p>
        Add a pdf document to ur library
      </p>
    </div>

    <form onSubmit={handleUpload}>
      <div>
        <label>
          Document title
        </label>
        <input
        type='text'
        upload={uploadTitle}
        onChange={(e)=>setUploadTitle(e.target.value)}
        required
        className=''
        placeholder='eg.React interview prep'
          />
        
      </div>

      <div>
        <label>
          PDF File
        </label>
        <div>
          <input
          type="file"
          className=''
          onChange={handleFileChange}
          accept='.pdf'
          
          />
          <div>
            <div>
              <Upload />


            </div>
            <p>{uploadFile ? (
              <span>{uploadFile.name}</span>
            ):(
              <>
              <span>
                Click to upload
              </span>
              or drag and drop
              
              </>
            )}</p>

            <p>Pdf upto 10mb</p>
          </div>
        </div>
      </div>

      <div>
        <button
        type='button'
        onClick={()=>setIsUploadModalOpen(false)}
        disabled={uploading}
        className=''
        >
          Cancel

        </button>
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
            "upload"
          
          )}

        </button>
      </div>
    </form>
  </div>

  </div>
)}

</div>



  )
}

export default DocumentListPage