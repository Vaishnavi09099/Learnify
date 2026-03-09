import FlashCard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";
import Document from "../models/Document.js"

export const getDashboard = async (req,res,next)=>{
    try{
        const userId = req.user._id;
        const totalDocuments = await Document.countDocuments({userId});
        const totalFlashcards = await FlashCard.countDocuments({userId});
        const totalQuizzes = await Quiz.countDocuments({userId});
        const completedQuizzes = await Quiz.countDocuments({userId ,isCompleted:true});

        const flashcardSets = await FlashCard.find({userId});
        let totalFlashcard = 0;
        let reviewedFlashcard = 0;
        let starredFlashcard = 0;

        flashcardSets.forEach(set=>{
            totalFlashcard +=set.cards.length;
            reviewedFlashcard +=set.cards.filter(c=> c.reviewCount>0).length;
            starredFlashcard = set.cards.filter(c=> c.isStarred).length;
        })

        const quizzes = await Quiz.find({userId,isCompleted:true});
        let avgScore = 0;
        if(quizzes.length>0){
            let totalScore = 0;
            for(let quiz of quizzes){
                totalScore+=quiz.score;
            }
            avgScore = Math.round(totalScore/quizzes.length);
        }


        const recentDocuments = await Document.find({userId})
        .sort({lastAccessed:-1})
        .limit(5)
        .select('title fileName lastAccessed status')

        const recentQuizzes = await Quiz.find({userId})
        .sort({createdAt:-1})
        .limit(5)
        .populate('documentId','title')
        .select('title score totalQuestions completedAt')

        const studyStreak = Math.floor(Math.random()*7)+1;

        res.status(200).json({
            success:true,
            data:{
                overview:{
                    totalDocuments,
                    totalFlashcards,
                    totalFlashcard,
                    reviewedFlashcard,
                    starredFlashcard,
                    totalQuizzes,
                    completedQuizzes,
                    avgScore,
                    studyStreak

                },
                recentActivity:{
                    documents:recentDocuments,
                    quizzes:recentQuizzes
                }
            }
        })




    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong!"
        })
        
    }
}