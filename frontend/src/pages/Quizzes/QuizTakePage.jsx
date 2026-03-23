import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../../services/quizService';

const QuizTakePage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Quiz fetch karo
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await quizService.getQuizById(quizId);
                setQuiz(response.data);
            } catch (error) {
                toast.error('Failed to fetch quiz.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    // Option select karo
    const handleOptionChange = (questionId, optionIndex) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex,
        }));
    };

    // Next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    // Previous question
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    // Submit quiz
    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        try {
            const answers = Object.keys(selectedAnswers).map((questionId) => ({
                questionId,
                selectedOption: selectedAnswers[questionId],
            }));
            await quizService.submitQuiz(quizId, answers);
            toast.success('Quiz submitted!');
            navigate(`/quizzes/${quizId}/results`);
        } catch (error) {
            toast.error('Failed to submit quiz.');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Quiz na mile
    if (!quiz || quiz.questions.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 font-semibold">Quiz not found or has no questions.</p>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isAnswered = selectedAnswers.hasOwnProperty(currentQuestion._id);
    const answeredCount = Object.keys(selectedAnswers).length;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const allAnswered = answeredCount === quiz.questions.length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">

                {/* Quiz Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    {quiz.title || 'Take Quiz'}
                </h1>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span className="font-semibold">
                            Question {currentQuestionIndex + 1} of {quiz.questions.length}
                        </span>
                        <span>{answeredCount} answered</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`
                            }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">

                    {/* Question Number Badge */}
                    <div className="mb-4">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
                            Question {currentQuestionIndex + 1}
                        </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-gray-800 font-semibold text-base mb-5">
                        {currentQuestion.question}
                    </p>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswers[currentQuestion._id] === index;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionChange(currentQuestion._id, index)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                                        isSelected
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {/* Radio Circle */}
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        isSelected
                                            ? 'border-emerald-500 bg-emerald-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {isSelected && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>

                                    {/* Option Text */}
                                    <span className="flex-1">{option}</span>

                                    {/* Check icon when selected */}
                                    {isSelected && (
                                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={submitting || !allAnswered}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <CheckCircle2 size={16} />
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    )}
                </div>

                {/* Question Number Pills */}
                <div className="flex justify-center gap-2 flex-wrap">
                    {quiz.questions.map((q, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`w-9 h-9 rounded-full text-sm font-semibold transition ${
                                index === currentQuestionIndex
                                    ? 'bg-emerald-500 text-white'
                                    : selectedAnswers[q._id] !== undefined
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default QuizTakePage;