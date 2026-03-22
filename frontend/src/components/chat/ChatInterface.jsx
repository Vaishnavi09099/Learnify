import { MessageSquare, Send, Sparkles } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import aiService from '../../services/aiService'
import { useAuth } from '../../context/AuthContext'
import { ClipLoader } from 'react-spinners'
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
    const {id:documentId} = useParams();
    const {user} = useAuth();
    const [history,setHistory] = useState([]);
    const [message,setMessage] = useState('');
    const [loading,setLoading] = useState(false);
    const [initialLoading,setInitialLoading] = useState(true);
    const messageEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({behavior:"smooth"})
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setInitialLoading(true);
                const response = await aiService.getChatHistory(documentId);
                setHistory(response.data);
            } catch(err) {
                console.log("Failed to fetch chat history: ", err);
            } finally {
                setInitialLoading(false);
            }
        }
        fetchChatHistory();
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { role: 'user', content: message, timestamp: new Date() };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await aiService.chat(documentId, userMessage.content);
            const assistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date(),
                relevantChunks: response.data.relevantChunks
            };
            setHistory(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setHistory(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (msg, index) => {
        const isUser = msg.role === "user";
        return (
            <div key={index} className={`flex gap-3 px-4 py-2 ${isUser ? "justify-end" : "justify-start"}`}>
                
               
                {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-green-700/80 text-white flex items-center shadow-md justify-center mt-1">
                        <Sparkles size={14} />
                    </div>
                )}

             
                <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm 
                    ${isUser
                        ? "bg-green-600/80 text-white rounded-br-none shadow-sm"
                        : "bg-white border-gray-300/60 shadow-sm rounded-xl  border text-gray-800 rounded-bl-none"
                    }`}>
                    {isUser ? (
                        <p>{msg.content}</p>
                    ) : (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                </div>

             
                {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gray-500/40 shadow-md  flex items-center justify-center text-black/80  text-sm font-semibold  mt-1">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </div>
        );
    };

    if (initialLoading) {
        return (
            <div className='flex shadow-lg h-[600px] m-5 rounded-xl flex-col gap-6 bg-white justify-center items-center'>
                <div className='rounded-xl p-2 bg-green-400/50 text-green-600'>
                    <MessageSquare />
                </div>
                <ClipLoader color="#00d492" size={24} />
                <p className='font-semibold text-gray-600'>Loading chat history.....</p>
            </div>
        )
    }

    return (
        <div className='flex flex-col h-[600px] m-5 rounded-xl bg-white shadow-lg'>
            
           
            <div className='flex-1 overflow-y-auto py-4'>
                {history.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-gray-400 gap-2'>
                        <MessageSquare size={36} />
                        <h3 className='font-semibold'>Start a conversation</h3>
                        <p className='text-sm'>Ask me anything about the document!</p>
                    </div>
                ) : (
                    history.map(renderMessage)
                )}

               
                {loading && (
                    <div className='flex items-center gap-3 px-4 py-2'>
                          <div className="w-8 h-8 rounded-xl bg-green-700/80 text-white flex items-center shadow-md justify-center mt-1">
                        <Sparkles size={14} />
                    </div>
                        <div className="bg-white border-gray-300/60 shadow-sm rounded-xl p-2  border text-gray-800 rounded-bl-none">
                            <ClipLoader color="green" size={16} />
                        </div>
                    </div>
                )}

                <div ref={messageEndRef} />
            </div>

          
            <div className='border-t border-gray-200 p-4'>
                <form onSubmit={handleSendMessage} className='flex gap-3'>
                    <input 
                        type='text' 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder='Ask a follow-up question...' 
                        className='flex-1 border rounded-xl border-gray-300 px-4 py-2 focus:border-green-500 focus:border-2 focus:outline-none text-sm'
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className='rounded-xl bg-green-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-green-700'>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChatInterface;