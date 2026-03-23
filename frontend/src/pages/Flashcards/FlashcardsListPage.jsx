import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, TrendingUp, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import flashCardService from '../../services/flashcardService';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const FlashcardListPage = () => {
    const { documentId } = useParams();
    const navigate = useNavigate();

    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchFlashcardSets();
    }, [documentId]);

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashCardService.getFlashcardsForDocument(documentId);
            // Handle all possible response shapes
            const sets = response?.data || response?.flashcards || response || [];
            setFlashcardSets(Array.isArray(sets) ? sets : []);
        } catch (err) {
            toast.error('Failed to fetch flashcard sets.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // Generate is under AI routes
            await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, { documentId });
            toast.success('Flashcards generated!');
            fetchFlashcardSets();
        } catch (err) {
            toast.error('Failed to generate flashcards.');
            console.error('Generate error:', err);
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (setId, e) => {
        e.stopPropagation();
        try {
            await flashCardService.deleteFlashcardSet(setId);
            toast.success('Deleted successfully!');
            setFlashcardSets(prev => prev.filter(s => s._id !== setId));
        } catch (err) {
            toast.error('Failed to delete.');
        }
    };

    const getTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={16} /> Back to Document
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Flashcards</h1>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
                    >
                        {generating
                            ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
                            : <><Plus size={16} /> Generate Flashcards</>
                        }
                    </button>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>

                /* Empty State */
                ) : flashcardSets.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center py-20 bg-white">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                            <BookOpen size={26} className="text-gray-400" />
                        </div>
                        <p className="text-gray-700 font-semibold text-lg">No Flashcards Yet</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Generate flashcards from your document to start learning.
                        </p>
                    </div>

                /* Flashcard Sets Grid */
                ) : (
                    <>
                        <h2 className="text-base font-semibold text-gray-700 mb-4">All Flashcard Sets</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {flashcardSets.map((set) => {
                                const reviewed = set.reviewedCount ?? 0;
                                const total = set.cards?.length ?? set.totalCards ?? 0;
                                const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;

                                return (
                                    <div
                                        key={set._id}
                                        className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                                    >
                                        {/* Set Header */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                                <BookOpen size={18} className="text-emerald-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                                                    {set.title}
                                                </p>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">
                                                    Created {getTimeAgo(set.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                                                {total} Cards
                                            </span>
                                            <span className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600 flex items-center gap-1">
                                                <TrendingUp size={12} className="text-emerald-500" />
                                                {progress}%
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-1">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>Progress</span>
                                                <span>{reviewed}/{total} reviewed</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-4">
                                            <button
                                                onClick={() => navigate(`/flashcards/${set._id}/study`)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium text-sm py-2 rounded-xl transition"
                                            >
                                                ✦ Study Now
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(set._id, e)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FlashcardListPage;