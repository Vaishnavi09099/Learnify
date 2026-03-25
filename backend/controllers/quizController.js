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

export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Please provide answers array"
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found"
            });
        }

        // reset if retake
        if (quiz.completedAt) {
            quiz.completedAt = null;
            quiz.userAnswers = [];
            quiz.score = 0;
        }

        let correctCount = 0;
        const userAnswers = [];

        answers.forEach(answer => {
            const { questionIndex, selectedAnswer } = answer;

            if (questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];

                const correctRaw = String(question.correctAnswer).trim();

                // ✅ "03:Mango" se sirf text nikalo
                const correctAnswerText = correctRaw.includes(':')
                    ? correctRaw.split(':').slice(1).join(':').trim()
                    : correctRaw;

                const isCorrect = String(selectedAnswer).trim().toLowerCase() ===
                                  correctAnswerText.toLowerCase();

                if (isCorrect) correctCount++;

                userAnswers.push({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });

        const total = quiz.totalQuestions || quiz.questions.length;

        const score = total > 0
            ? Math.round((correctCount / total) * 100)
            : 0;

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
                totalQuestions: total,
                percentage: score,
                userAnswers
            },
            message: "Quiz submitted successfully!"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Quiz not submitted successfully!"
        });
    }
};

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