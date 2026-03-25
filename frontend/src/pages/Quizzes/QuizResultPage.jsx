import { ArrowLeft, BookOpen, CheckCircle2, Target, Trophy, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import quizService from '../../services/quizService'
import PageHeader from '../../components/common/PageHeader'
import toast from 'react-hot-toast'
import AppLayout from '../../components/layout/AppLayout'
import { ClipLoader } from 'react-spinners';


const QuizResultPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
         console.log("API Response:", data);
        setResults(data);
      } catch (error) {
        toast.error("Failed to fetch quiz results.");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId]);

  if (loading) {
    return <ClipLoader color="#00d492" size={24} />;
  }

  if (!results || !results.data) {
    return (
      <div>
        <div>
          <p>Quiz results not found</p>
        </div>
      </div>
    );
  }


const quiz = results?.data;
const detailedResults = results?.results ?? [];


  const score = quiz?.score ?? 0;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter(r => r.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

   if (!quiz) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Results not found.</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Outstanding!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good work!';
    if (score >= 60) return 'Not bad!';
    return 'Keep practicing!';
  };
  console.log("Results:", detailedResults);

  return (
    <AppLayout>
      <div className="flex items-center p-4 text-gray-700">
  <Link 
    to={`/documents/${quiz.document._id}`} 
    className="flex items-center gap-1"
  >
    <ArrowLeft strokeWidth={2} size={15}/>
    <span>Back to document</span>
  </Link>
</div>

<div className='p-4'>
   <PageHeader title={`${quiz.title || 'Quiz'} Results`} />

</div>
     
      

      <div className=' w-150 mx-auto   border border-gray-300/50 flex justify-center p-10 bg-white rounded-xl shadow-lg   text-center '>
       

      
          <div>
            <div className='flex w-fit mx-auto  items-center justify-center bg-green-400/30 rounded-md p-3 shadow-md  text-green-800/80 '>
              <Trophy size={24}/>
            </div>

            <div>
              <p className=' mt-5 uppercase font-bold text-gray-600'>Your score</p>
              <div className={` font-bold text-orange-600 text-4xl mt-2 mb-1 ${getScoreColor(score)}`}>
                {score}%
              </div>
              <p className='font-semibold text-gray-600'>
                {getScoreMessage(score)} 
              </p>
            </div>
     
<div className="flex gap-4 pt-8 justify-center">
  <button
    onClick={() => navigate(`/quizzes/${quizId}/take`)}
    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md transition"
  >
    <Trophy size={16} />
    Retake Quiz
  </button>
</div>

<div className="flex gap-10 pt-10 ">
  <div className="flex text-gray-800 bg-gray-200/50 shadow-md gap-1 items-center border border-gray-500/30 px-4 py-2 font-semibold rounded-xl ">
    <Target className="" strokeWidth={2} size={15} />
    <span className="">
      {totalQuestions} Total
    </span>
  </div>

  <div className="flex text-green-800 bg-green-400/50 shadow-md gap-1 items-center border border-green-500/30 px-4 py-2 font-semibold rounded-xl ">
    <CheckCircle2 className=""strokeWidth={2} size={15} />
    <span className="">
      {correctAnswers} Correct
    </span>
  </div>

  <div className="flex text-red-800 bg-red-200/50 shadow-md gap-1 items-center border border-red-500/30 px-4 py-2 font-semibold rounded-xl ">
    <XCircle className="" strokeWidth={2} size={15} />
    <span className="">
      {incorrectAnswers} Incorrect
    </span>
  </div>
</div>





          </div>
        </div>


        <div className='p-10  mx-15'>
          <div className='flex items-center gap-2 font-semibold text-lg mb-8'>
            <BookOpen strokeWidth={3} size={22}/>
            <h3>Detailed Review</h3>
          </div>

          {detailedResults.map((result,index)=>{
            const userAnswerIndex = result.options.findIndex(opt =>opt === result.selectedAnswer)

             const correctAnswerIndex = result.correctAnswer.startsWith('0')
    ? parseInt(result.correctAnswer.substring(1))
    : result.options.findIndex(
        opt => opt === result.correctAnswer
      );
      const isCorrect = result.isCorrect;

      return(
        <div key={index} className='border-2 mb-5 rounded-xl shadow-md bg-white border-gray-600/20 p-6'>
          <div>
            <div >
              <div className='flex justify-between'>
             
 <div className='border flex justify-start w-fit px-4 rounded-xl shadow-md bg-gray-300/30  items-center text-gray-800/70 font-bold border-gray-600/40'>
                <span>Question {index+1}</span>
              </div>
                  <div
  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center    ${
    isCorrect
      ? 'bg-green-50 border-2 border-green-200 text-green-800/60'
      : 'bg-red-50 border-2 border-red-200 text-red-800/60'
  }`}
>
  {isCorrect ? (
    <CheckCircle2 className="" strokeWidth={2.5} />
  ) : (
    <XCircle className="" strokeWidth={2.5} />
  )}
</div>
              </div>
                       
             
          
            </div>
 
 <div className='pt-3 font-semibold mb-3'>
      <h4>{result.question}</h4>
 </div>

<div className="mb-2 flex flex-col gap-2">
  {result.options.map((option, optIndex) => {
   const isCorrectOption = optIndex === correctAnswerIndex;
const isUserAnswer = optIndex === userAnswerIndex;       
const isWrongAnswer = isUserAnswer && !isCorrect;
   return (
  <div
    key={optIndex}
    className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all font-semibold duration-200
      ${isCorrectOption
        ? "bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-100"
        : isWrongAnswer
        ? "bg-rose-50 border-rose-300"
        : "bg-slate-50 border-slate-200"
      }`}
  >
    <span className={`text-sm font-medium ${
      isCorrectOption ? "text-emerald-900"
      : isWrongAnswer ? "text-rose-900"
      : "text-slate-700"
    }`}>
      {option}
    </span>

    <div className="flex items-center gap-1 text-xs font-semibold">
      {isCorrectOption && (
        <span className="flex items-center gap-1 text-emerald-600">
          <CheckCircle2 size={14} /> Correct
        </span>
      )}
      {isWrongAnswer && (
        <span className="flex items-center gap-1 text-rose-600">
          <XCircle size={14} /> Your Answer
        </span>
      )}
    </div>
  </div>
);
  })}
</div>


{result.explanation && (

  <div className="mt-4 bg-gray-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-start gap-2">
      <div className=' bg-gray-500/20 flex shadow-md rounded-xl items-center p-2'>
          <BookOpen size={17} className="text-gray-600 mt-1 shrink-0" /> 

      </div>
    
      <div>
        <p className="text-xs font-bold text-gray-700 uppercase mb-1">Explanation</p>
        <p className="text-sm text-gray-800">{result.explanation}</p>
      </div>
    </div>
  </div>
)}
          </div>


        </div>
      )

          })}


        </div>

      

    </AppLayout>
  );
};


export default QuizResultPage;