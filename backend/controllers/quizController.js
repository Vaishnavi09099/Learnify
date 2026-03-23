import Quiz from "../models/Quiz.js";

export const getQuizzes = async(req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId
        }).populate('documentId', 'title fileName')

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch(err) {
        res.status(500).json({
            success: false,
            message: "error fetching quizzes"
        });
    }
}

export const getQuizById = async(req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        })

        if(!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found!"
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch(err) {
        res.status(500).json({
            success: false,
            message: "error fetching quiz"
        });
    }
}

export const submitQuiz = async(req, res, next) => {
    try {
        const {answers} = req.body;
        if(!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Please provide answers array"
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found"
            });
        }

        // Reset karo agar pehle complete ho chuki hai (retake allow)
        if(quiz.completedAt) {
            quiz.completedAt = null;
            quiz.userAnswers = [];
            quiz.score = 0;
        }

        let correctCount = 0;
        const userAnswers = [];

        answers.forEach(answer => {
            const { questionIndex, selectedAnswer } = answer;

            if(questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                const isCorrect = selectedAnswer === question.correctAnswer;

                if(isCorrect) correctCount++;

                userAnswers.push({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });

        const score = Math.round((correctCount / quiz.totalQuestions) * 100);
        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: score,
                userAnswers
            },
            message: "Quiz submitted successfully!"
        });

    } catch(err) {
        return res.status(400).json({
            success: false,
            message: "Quiz not submitted successfully!"
        });
    }
}

export const getQuizResults = async(req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title')

        if(!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found"
            });
        }

        if(!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: "Quiz not completed yet"
            });
        }

        const detailedResults = quiz.questions.map((question, index) => {
           const userAnswer = quiz.userAnswers.find(a => Number(a.questionIndex) === Number(index))
            return {
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer ?? null,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation
            }
        });

        res.status(200).json({
            success: true,
            data: {
                id: quiz._id,
                title: quiz.title,
                document: quiz.documentId,
                score: quiz.score,
                totalQuestions: quiz.totalQuestions,
                completedAt: quiz.completedAt
            },
            results: detailedResults
        });

    } catch(err) {
        return res.status(400).json({
            success: false,
            message: "Result not published!"
        });
    }
}

export const deleteQuiz = async(req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        })

        if(!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found"
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            message: "Quiz deleted successfully!"
        });

    } catch(err) {
        return res.status(400).json({
            success: false,
            message: "Error while deleting quiz!"
        });
    }
}