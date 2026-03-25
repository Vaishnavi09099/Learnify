import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentListPage from './pages/Documents/DocumentListPage';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';

import FlashCardPage from './pages/Flashcards/FlashCardPage';
import QuizResultPage from './pages/Quizzes/QuizResultPage';
import QuizTakePage from './pages/Quizzes/QuizTakePage';
import ProfilePage from './pages/Profile/ProfilePage';
import { useAuth } from './context/AuthContext';

const App = () => {

    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <p>Loading.......</p>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
                />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />

                <Route path="/documents" element={isAuthenticated ? <DocumentListPage /> : <Navigate to="/login" replace />} />

                <Route path="/documents/:id" element={isAuthenticated ? <DocumentDetailPage /> : <Navigate to="/login" replace />} />

                <Route path="/documents/:id/flashcards" element={isAuthenticated ? <FlashCardPage /> : <Navigate to="/login" replace />} />

                <Route path="/quizzes/:quizId/take" element={isAuthenticated ? <QuizTakePage /> : <Navigate to="/login" replace />} />

                <Route path="/quizzes/:quizId/results" element={isAuthenticated ? <QuizResultPage /> : <Navigate to="/login" replace />} />

                <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />

                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    )
}

export default App