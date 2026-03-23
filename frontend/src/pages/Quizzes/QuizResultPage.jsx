import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../../services/quizService';

const QuizResultPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await quizService.getQuizResults(quizId);
                setResult(response);
            } catch (err) {
                toast.error('Failed to fetch results.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [quizId]);

    // ✅ Universal function — handles index (0,1,2) AND text-based correctAnswer
    const resolveIndex = (options, answer) => {
        if (answer === null || answer === undefined) return -1;

        const num = Number(answer);

        // If it's a valid numeric index
        if (!isNaN(num) && num >= 0 && num < options.length) {
            return num;
        }

        // Otherwise match by text
        return options.findIndex(opt => opt === answer);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Results not found</p>
            </div>
        );
    }

    const { data, results } = result;

    const correctCount = results.filter(item => {
        const correctIndex = resolveIndex(item.options, item.correctAnswer);
        const selectedIndex = resolveIndex(item.options, item.selectedAnswer);
        return selectedIndex !== -1 && selectedIndex === correctIndex;
    }).length;

    const incorrectCount = results.length - correctCount;

    const getScoreMessage = (score) => {
        if (score >= 90) return 'Outstanding!';
        if (score >= 70) return 'Great Job!';
        if (score >= 50) return 'Good Effort!';
        return 'Keep Practicing!';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">

                {/* Back */}
                <button onClick={() => navigate(-1)} className="mb-4 flex gap-1 text-sm">
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Title */}
                <h1 className="text-2xl font-bold mb-4">
                    {data.title} - Results
                </h1>

                {/* Score Card */}
                <div className="bg-white p-6 rounded-xl mb-6 text-center border">
                    <Trophy className="mx-auto text-emerald-500 mb-2" size={30} />
                    <p className="text-4xl font-bold text-emerald-500">{data.score}%</p>
                    <p>{getScoreMessage(data.score)}</p>

                    <div className="flex justify-center gap-4 mt-4 text-sm">
                        <span>{results.length} Total</span>
                        <span className="text-green-600">{correctCount} Correct</span>
                        <span className="text-red-500">{incorrectCount} Incorrect</span>
                    </div>
                </div>

                {/* Questions Review */}
                {results.map((item, index) => {

                    const correctIndex = resolveIndex(item.options, item.correctAnswer);
                    const selectedIndex = resolveIndex(item.options, item.selectedAnswer);

                    return (
                        <div key={index} className="bg-white p-4 mb-4 rounded-xl border">

                            <p className="font-semibold mb-2">
                                Q{index + 1}. {item.question}
                            </p>

                            {item.options.map((option, i) => {

                                const isCorrect = i === correctIndex;
                                const isSelected = i === selectedIndex;
                                const isWrong = isSelected && !isCorrect;

                                return (
                                    <div
                                        key={i}
                                        className={`p-2 mb-1 rounded border flex justify-between ${
                                            isCorrect
                                                ? 'bg-green-100 border-green-400 text-green-700'
                                                : isWrong
                                                ? 'bg-red-100 border-red-400 text-red-600'
                                                : 'border-gray-200'
                                        }`}
                                    >
                                        <span>{option}</span>
                                        <span className="text-xs">
                                            {isCorrect && isSelected && "✓ Your Answer (Correct)"}
                                            {isCorrect && !isSelected && "Correct Answer"}
                                            {isWrong && "✗ Your Answer"}
                                        </span>
                                    </div>
                                );
                            })}

                            {item.explanation && (
                                <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                                    <b>Explanation:</b> {item.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Footer */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-emerald-500 text-white px-5 py-2 rounded"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResultPage;