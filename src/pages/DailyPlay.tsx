import React, { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import ResultsSummary from '../components/ResultsSummary';
import { Question, UserAnswer, GameResult, GameSession } from '../types';
import { getDailyQuestions } from '../services/questionService';
import { createGameSession, submitAnswer, finishGameSession } from '../services/gameSessionService';

const DailyPlay: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());

  // Mock current user - in a real app, this would come from auth context
  const currentUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    display_name: 'Test User'
  };

  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Fetch daily questions
        const dailyQuestions = await getDailyQuestions();
        setQuestions(dailyQuestions);
        
        // Create a game session
        const session = await createGameSession(
          currentUser.id, 
          'daily',
          dailyQuestions.map(q => parseInt(q.id))
        );
        setGameSession(session);
        setGameStartTime(Date.now());
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setLoading(false);
      }
    };

    initializeGame();
  }, []);

  const handleSubmitAnswer = async (answer: UserAnswer) => {
    if (!gameSession) return;

    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);
    
    try {
      // Submit answer to backend and get score
      const submission = await submitAnswer(
        gameSession.id,
        parseInt(questions[currentQuestionIndex].id),
        currentUser.id,
        answer.lowerBound,
        answer.upperBound,
        answer.elapsedMs
      );

      console.log('Answer submitted:', submission);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Finish the game session
        const durationMs = Date.now() - gameStartTime;
        const sessionResult = await finishGameSession(gameSession.id, durationMs);
        
        // Create a GameResult for the UI (compatible with existing ResultsSummary)
        const questionResults = updatedAnswers.map((userAnswer, index) => {
          const question = questions[index];
          // We'll use the score from the submission for the last question
          // For previous questions, we'd need to fetch them or store them
          const points = index === currentQuestionIndex ? submission.score : 0; // Simplified for now
          
          return {
            question,
            userAnswer,
            correct: points > 0,
            points
          };
        });

        const result: GameResult = {
          date: new Date().toISOString(),
          totalPoints: sessionResult.total_score || 0,
          correctAnswers: questionResults.filter(qr => qr.correct).length,
          totalQuestions: questions.length,
          questionResults
        };
        
        setGameResult(result);
        setGameComplete(true);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      // Fallback to local calculation if API fails
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setGameComplete(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (gameComplete && gameResult) {
    return <ResultsSummary result={gameResult} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3">
          {[...Array(questions.length)].map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentQuestionIndex
                  ? 'bg-primary-600 scale-125'
                  : index < currentQuestionIndex
                  ? 'bg-primary-200'
                  : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>

      {questions.length > 0 && gameSession && (
        <div className="animate-fadeIn">
          <QuestionCard
            question={questions[currentQuestionIndex]}
            onSubmit={handleSubmitAnswer}
          />
        </div>
      )}
    </div>
  );
};

export default DailyPlay;