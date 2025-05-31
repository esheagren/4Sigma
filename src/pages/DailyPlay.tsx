import React, { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import ResultsSummary from '../components/ResultsSummary';
import { Question, UserAnswer, GameResult } from '../types';
import { getDailyQuestions } from '../services/questionService';
import Score from '../services/scoringService';

const DailyPlay: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const dailyQuestions = await getDailyQuestions();
        setQuestions(dailyQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch daily questions:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleSubmitAnswer = (answer: UserAnswer) => {
    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate results using the new scoring algorithm
      const questionResults = updatedAnswers.map((answer, index) => {
        const question = questions[index];
        const score = Score.calculateScore(
          answer.lowerBound,
          answer.upperBound,
          question.answer
        );

        return {
          question,
          userAnswer: answer,
          correct: score >= 0, // Score is -1 if outside bounds
          points: Math.max(0, score * 100) // Convert to 0-100 scale
        };
      });

      const result: GameResult = {
        date: new Date().toISOString(),
        totalPoints: questionResults.reduce((sum, qr) => sum + qr.points, 0),
        correctAnswers: questionResults.filter(qr => qr.correct).length,
        totalQuestions: questions.length,
        questionResults
      };
      
      setGameResult(result);
      setGameComplete(true);
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

      {questions.length > 0 && (
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

export default DailyPlay