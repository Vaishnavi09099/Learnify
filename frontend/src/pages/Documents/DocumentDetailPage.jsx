import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import documentService from '../../services/documentService'
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader.jsx'
import Tabs from '../../components/common/Tabs'
import { ClipLoader } from 'react-spinners'
import ChatInterface from '../../components/chat/ChatInterface.jsx'
import AIActions from '../../components/chat/AIActions.jsx'
import FlashcardManager from '../Flashcards/FlashcardManager.jsx'
import QuizManager from '../Quizzes/QuizManager.jsx'
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (err) {
        toast.error("Failed to fetch document details.");
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocumentDetails();
  }, [id]);

  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;
    const filePath = document.data.filePath;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const baseurl = 'http://localhost:5000';
    return `${baseurl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  const renderContent = () => {
    if (loading) return <ClipLoader color="#00d492" size={24} />;
    if (!document || !document.data || !document.data.filePath) {
      return <div>PDF not available</div>
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className='flex flex-col'>
        <div className='border rounded-t-lg p-1 border-gray-400/60 flex justify-between'>
          <div className='p-2'>
            <span className='text-gray-600 font-medium'>Document Viewer</span>
          </div>
          <a href={pdfUrl} target='_blank' rel='noopener noreferrer'
            className='flex items-center gap-1 text-blue-600 font-bold p-2'>
            <ExternalLink size={16} strokeWidth={3} />
            <span>Open link in new tab</span>
          </a>
        </div>
        <div className='border rounded-b-lg border-gray-400/60 overflow-y-auto flex justify-center bg-gray-100'
          style={{ maxHeight: '80vh' }}>
          <PDFDocument
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(err) => console.log('PDF load error:', err)}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <Page
                key={i + 1}
                pageNumber={i + 1}
                width={800}
                className='mb-2'
              />
            ))}
          </PDFDocument>
        </div>
      </div>
    );
  }

  const renderChat = () => {
    return <ChatInterface />;
  }

  const renderAIActions = () => {
    return <AIActions />;
  }

  const renderFlashCardsTab = () => {
    return <FlashcardManager documentId={id} />;
  }

  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />;
  };

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI actions', label: 'AI actions', content: renderAIActions() },
    { name: 'Flashcards', label: 'Flashcards', content: renderFlashCardsTab() },
    { name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() },
  ]

  if (loading) {
    return <ClipLoader color="#00d492" size={24} />;
  }
  if (!document || !document.data || !document.data.filePath) {
    return <div>PDF not available</div>
  }

  return (
    <AppLayout>
      <div className='flex items-center gap-1 p-2 m-2 text-gray-600 font-semibold'>
        <ArrowLeft size={15} strokeWidth={2.5} />
        <Link to="/documents">
          Back to Documents
        </Link>
      </div>
      <div className='p-4'>
        <PageHeader title={document.data.title} />
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </AppLayout>
  )
}

export default DocumentDetailPage;