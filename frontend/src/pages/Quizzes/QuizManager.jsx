import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, BarChart2, Play,Trophy} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import aiService from '../../services/aiService';


const QuizManager = ({ documentId }) => {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const data = await quizService.getQuizzesForDocument(documentId);
            setQuizzes(data.data);
        } catch (error) {
            toast.error('Failed to fetch quizzes.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchQuizzes();
        }
    }, [documentId]);

    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await aiService.generateQuiz(documentId, { numQuestions });
            toast.success('Quiz generated successfully!');
            setIsGenerateModalOpen(false);
            fetchQuizzes();
        } catch (error) {
            toast.error(error.message || 'Failed to generate quiz.');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleting(true);
        try {
            await quizService.deleteQuiz(selectedQuiz._id);
            toast.success('Quiz deleted successfully!');
            setIsDeleteModalOpen(false);
            setSelectedQuiz(null);
            fetchQuizzes();
        } catch (error) {
            toast.error(error.message || 'Failed to delete quiz.');
        } finally {
            setDeleting(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/quizzes/${quizId}/take`);
    };

    const handleViewResults = (quizId) => {
        navigate(`/quizzes/${quizId}/results`);
    };

   
    return (
        <div className="p-4 bg-white rounded-xl  border-gray-300/60 shadow-lg border ">

       
            <div className="flex justify-end mb-5 mt-2  ">
                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="flex items-center gap-1 rounded-xl px-4 py-2 shadow-md text-white font-semibold bg-green-600"
                >
                    <Plus size={16} strokeWidth={3}/>

                    Generate Quiz
                </button>
            </div>

          
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : quizzes.length === 0 ? (
              
                <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-16 ">
                    <div className='bg-gray-200 p-4 rounded-xl mb-4 shadow-md'>
                        <FileText size={30} className="text-gray-600 " />

                    </div>
                    
                    <p className="text-gray-700 font-semibold text-lg">No Quizzes Yet</p>
                    <p className="text-gray-400 text-sm mt-1 font-semibold ">Generate a quiz from your document to test your knowledge.</p>
                </div>
            ) : (
               
                <div className="flex gap-4 flex-wrap">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz._id}
                            className="border-2 border-gray-400/20 rounded-xl p-4 flex flex-col gap-3 bg-white shadow-sm"
                        >
                           
                            <div className="flex items-center justify-between text-green-900 font-semibold">
                                <div className='flex items-center text-xs gap-1 border rounded-md justify-center shadow-md bg-green-200/20 border-green-500/40 px-2 py-1 '>
                                    <Trophy size={13}/>
                                    <p> Score: {quiz.score ?? 0}</p> 
                                </div>
                               
                                <button
                                    onClick={() => handleDeleteRequest(quiz)}
                                    className="text-gray-400 hover:text-red-500 transition"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                          

                          
                            <div className='mb-2'>
                                <p className="font-bold text-gray-800 text-md mr-10 mt-2 ">{quiz.title}</p>
                                <p className="text-xs text-gray-400 mt-1 font-semibold"> CREATED {new Date(quiz.createdAt).toLocaleDateString()}</p>

                            </div>
                            <hr className='ml-1 mr-1 border- border-gray-400/10'></hr>

                            
                            <span className="text-xs border border-gray-200 rounded-md px-3 py-1 w-fit  text-gray-600 font-bold bg-gray-300/20 shadow-sm">
                                {quiz.questions?.length ?? numQuestions} Questions
                            </span>

                      
                         <hr className='ml-1 mr-1 border- border-gray-400/10'></hr>
                            {quiz.score > 0 ? (
                                <button
                                    onClick={() => handleViewResults(quiz._id)}
                                    className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm transition"
                                >
                                    <BarChart2 size={15} />
                                    View Results
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleStartQuiz(quiz._id)}
                                    className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600  text-white py-2 rounded-lg text-sm  font-semibold transition shadow-md mt-3"
                                >
                                    <Play size={14} strokeWidth={3}/>
                                    Start Quiz
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

          
            {isGenerateModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className=" font-bold text-xl">Generate New Quiz</h2>
                            <button onClick={() => setIsGenerateModalOpen(false)} className="text-gray-800 hover:text-gray-600 font-bold">X</button>
                        </div>
                        <form onSubmit={handleGenerateQuiz}>
                            <label className="text-sm text-gray-700 ">Number of Questions</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(Number(e.target.value))}
                                className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-2 focus:border-green-700/60 mb-4"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGenerateModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg shadow-md  hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="px-4 py-2 text-sm bg-green-500 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-60 shadow-md "
                                >
                                    {generating ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

          
            {isDeleteModalOpen  && (
                <div className="fixed inset-0 bg-black/40  backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className=" font-bold text-gray-800">Confirm Delete Quiz</h2>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">x</button>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                            Are you sure you want to delete the quiz{' '}
                            <span className="font-semibold text-gray-800">{selectedQuiz.title}</span>?
                            <br />This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-sm text-gray-600 border font-semibold shadow-sm border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold shadow-sm  disabled:opacity-60"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



export default QuizManager;