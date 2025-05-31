import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronRight, Share2, Sparkles, Calculator, Info } from 'lucide-react';
import BellCurveVisualization from './BellCurveVisualization';
import { GameResult } from '../types';
import { useCountUp } from '../hooks/useCountUp';

interface ResultsSummaryProps {
  result: GameResult;
  historicalResults?: GameResult[];
}

interface Statistics {
  average: number;
  highScore: number;
  calibrationRate: number;
  standardDeviation: number;
}

const calculateStatistics = (results: GameResult[]): Statistics => {
  const scores = results.map(r => r.totalPoints);
  const calibrations = results.reduce((acc, r) => acc + r.correctAnswers, 0) / 
                      results.reduce((acc, r) => acc + r.totalQuestions, 0) * 100;
  
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const highScore = Math.max(...scores);
  
  // Calculate standard deviation
  const squareDiffs = scores.map(score => Math.pow(score - average, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / scores.length;
  const standardDeviation = Math.sqrt(avgSquareDiff);

  return {
    average,
    highScore,
    calibrationRate: calibrations,
    standardDeviation
  };
};

const ResultsSummary: React.FC<ResultsSummaryProps> = ({ result, historicalResults = [] }) => {
  const todayScore = useCountUp(Math.round(result.totalPoints));
  const hasExactMatch = result.questionResults.some(
    qr => qr.userAnswer.lowerBound === qr.userAnswer.upperBound && 
         qr.userAnswer.lowerBound === qr.question.answer
  );

  const allTimeStats = calculateStatistics([...historicalResults, result]);
  const todayStats = calculateStatistics([result]);
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Challenge Results</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          {new Date(result.date).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Performance Statistics */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Today's Performance */}
            <div className="space-y-4">
              <h3 className="font-medium text-neutral-600 dark:text-neutral-400">Today's Performance</h3>
              <div className="space-y-3">
                <StatRow 
                  label="Your Score" 
                  tooltip="Points earned in today's challenge"
                  value={todayScore.toString()}
                  comparison={`${(todayStats.average - allTimeStats.average).toFixed(1)} vs avg`}
                  isPositive={todayStats.average >= allTimeStats.average}
                  highlight={true}
                />
                <StatRow 
                  label="Average Score" 
                  tooltip="Average score across all players today"
                  value={allTimeStats.average.toFixed(1)}
                />
                <StatRow 
                  label="Standard Deviation" 
                  tooltip="Measure of score variation among all players"
                  value={todayStats.standardDeviation.toFixed(1)}
                />
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  {result.correctAnswers}/{result.totalQuestions} correctly calibrated
                </div>
              </div>
            </div>

            {/* All-time Performance */}
            <div className="space-y-4">
              <h3 className="font-medium text-neutral-600 dark:text-neutral-400">Your All-time Performance</h3>
              <div className="space-y-3">
                <StatRow 
                  label="Average Score" 
                  tooltip="Your average score across all games"
                  value={allTimeStats.average.toFixed(1)} 
                />
                <StatRow 
                  label="High Score" 
                  tooltip="Your highest score achieved"
                  value={allTimeStats.highScore.toFixed(1)} 
                />
                <StatRow 
                  label="Calibration Rate" 
                  tooltip="Percentage of answers where true value falls within your bounds"
                  value={`${allTimeStats.calibrationRate.toFixed(1)}%`} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Question Results */}
      <div className="space-y-6 mb-8">
        <h3 className="text-lg font-medium">Question Breakdown</h3>
        {result.questionResults.map((qResult, index) => {
          const isExactMatch = qResult.userAnswer.lowerBound === qResult.userAnswer.upperBound && 
                             qResult.userAnswer.lowerBound === qResult.question.answer;
          
          return (
            <div 
              key={index}
              className={`p-4 rounded-md ${
                qResult.correct
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {qResult.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{qResult.question.text}</h4>
                    <span className="font-bold text-lg">
                      {Math.round(qResult.points)} points
                    </span>
                  </div>

                  <BellCurveVisualization
                    lowerBound={qResult.userAnswer.lowerBound}
                    upperBound={qResult.userAnswer.upperBound}
                    correctAnswer={qResult.question.answer}
                    unit={qResult.question.unit}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center gap-4">
        <Link 
          to="/practice" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
        >
          Practice More
          <ChevronRight size={18} />
        </Link>
        <button 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 font-medium transition-colors"
        >
          Share Results
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

interface StatRowProps {
  label: string;
  value: string;
  tooltip?: string;
  comparison?: string;
  isPositive?: boolean;
  highlight?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, tooltip, comparison, isPositive, highlight }) => {
  return (
    <div className="flex justify-between items-center group relative">
      <div className="flex items-center gap-1">
        <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
        {tooltip && (
          <div className="relative">
            <Info size={14} className="text-neutral-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 dark:bg-neutral-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-48 text-center z-10">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" />
            </div>
          </div>
        )}
      </div>
      <div className="text-right">
        <span className={`font-medium ${highlight ? 'text-2xl text-primary-600 dark:text-primary-400' : ''}`}>
          {value}
        </span>
        {comparison && (
          <span className={`ml-2 text-sm ${
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? '↑' : '↓'} {comparison}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResultsSummary;