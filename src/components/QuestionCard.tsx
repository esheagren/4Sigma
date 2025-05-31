import React, { useState } from 'react';
import { ArrowRight, Calculator, BookmarkPlus } from 'lucide-react';
import NumericRangeInput from './NumericRangeInput';
import { Question, UserAnswer } from '../types';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: UserAnswer) => void;
  onSaveToPersonalDeck?: () => void;
  showSaveOption?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onSubmit, 
  onSaveToPersonalDeck,
  showSaveOption = false
}) => {
  const [lowerBound, setLowerBound] = useState<number | null>(null);
  const [upperBound, setUpperBound] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNumericInputChange = (lower: number | null, upper: number | null) => {
    setLowerBound(lower);
    setUpperBound(upper);
    setError(null);
  };

  const handleSubmit = () => {
    if (lowerBound === null || upperBound === null) {
      setError("Please provide both lower and upper bounds");
      return;
    }
    
    if (upperBound < lowerBound) {
      setError("Upper bound cannot be less than lower bound");
      return;
    }
    
    onSubmit({
      questionId: question.id,
      lowerBound,
      upperBound,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden transition-all">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {question.category}
          </span>
          
          {showSaveOption && onSaveToPersonalDeck && (
            <button 
              onClick={onSaveToPersonalDeck}
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
              aria-label="Save to personal deck"
            >
              <BookmarkPlus size={16} />
              <span>Save</span>
            </button>
          )}
        </div>
        
        <h2 className="text-xl font-serif font-medium mt-2 mb-2">
          {question.text}
        </h2>
        
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-full">
            {question.unit}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Your 95% Confidence Interval</h3>
          <NumericRangeInput 
            onChange={handleNumericInputChange}
            lowerBound={lowerBound}
            upperBound={upperBound}
            unit={question.unit}
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
          >
            Submit
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;