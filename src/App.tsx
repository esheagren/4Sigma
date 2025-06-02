import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';
import DailyPlay from './pages/DailyPlay';
import PracticeMode from './pages/Explore';
import ProfileDashboard from './pages/ProfileDashboard';
import QuestionManagement from './pages/QuestionManagement';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Navigate to="/daily" replace />} />
                <Route path="/daily" element={<DailyPlay />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/practice" element={<PracticeMode />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/questions" element={<QuestionManagement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;