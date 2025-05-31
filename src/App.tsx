import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import AboutPage from './pages/AboutPage';
import DailyPlay from './pages/DailyPlay';
import PracticeMode from './pages/PracticeMode';
import ProfileDashboard from './pages/ProfileDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/daily\" replace />} />
              <Route path="/daily" element={<DailyPlay />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/practice" element={<PracticeMode />} />
              <Route path="/profile" element={<ProfileDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;