import React, { useState, useEffect } from 'react';
import { Search, Filter, BookmarkPlus, X, CheckCircle, XCircle, Plus } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import BellCurveVisualization from '../components/BellCurveVisualization';
import { Question, UserAnswer } from '../types';
import { getQuestions } from '../services/questionService';

const PracticeMode: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalDeck, setPersonalDeck] = useState<Question[]>([]);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<UserAnswer | null>(null);
  const [saveAnimation, setSaveAnimation] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const allQuestions = await getQuestions();
        setQuestions(allQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
    loadPersonalDeck();
  }, []);

  const loadPersonalDeck = () => {
    const savedDeck = localStorage.getItem('personalDeck');
    if (savedDeck) {
      setPersonalDeck(JSON.parse(savedDeck));
    }
  };

  const saveToPersonalDeck = (question: Question) => {
    const updatedDeck = [...personalDeck];
    if (!updatedDeck.some(q => q.id === question.id)) {
      updatedDeck.push(question);
      setPersonalDeck(updatedDeck);
      localStorage.setItem('personalDeck', JSON.stringify(updatedDeck));
      
      // Trigger save animation
      setSaveAnimation(question.id);
      setTimeout(() => setSaveAnimation(null), 1000);
    }
  };

  const handleSubmitAnswer = (answer: UserAnswer) => {
    if (!selectedQuestion) return;
    setLastAnswer(answer);
    setShowingAnswer(true);
  };

  const handleNextQuestion = () => {
    setSelectedQuestion(null);
    setShowingAnswer(false);
    setLastAnswer(null);
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || question.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(questions.map(q => q.category)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (selectedQuestion) {
    if (showingAnswer && lastAnswer) {
      const isCorrect = lastAnswer.lowerBound <= selectedQuestion.answer && selectedQuestion.answer <= lastAnswer.upperBound;
      
      return (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleNextQuestion}
            className="mb-6 inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
          >
            <X size={20} />
            Back to questions
          </button>
          
          <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 ${
            isCorrect 
              ? 'border-2 border-green-500 dark:border-green-600' 
              : 'border-2 border-red-500 dark:border-red-600'
          }`}>
            <div className="flex items-start gap-3 mb-6">
              {isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0" />
              )}
              <div>
                <h2 className="text-xl font-medium mb-1">{selectedQuestion.text}</h2>
                <p className={`text-lg ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isCorrect ? 'Correct estimation' : 'Incorrect estimation'}
                </p>
              </div>
            </div>

            <BellCurveVisualization
              lowerBound={lastAnswer.lowerBound}
              upperBound={lastAnswer.upperBound}
              correctAnswer={selectedQuestion.answer}
              unit={selectedQuestion.unit}
            />
            
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  saveToPersonalDeck(selectedQuestion);
                  handleNextQuestion();
                }}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add to collection
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setSelectedQuestion(null)}
          className="mb-6 inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
        >
          <X size={20} />
          Back to questions
        </button>
        <QuestionCard
          question={selectedQuestion}
          onSubmit={handleSubmitAnswer}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {filteredQuestions.map(question => (
            <div
              key={question.id}
              className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-all p-6 cursor-pointer relative ${
                saveAnimation === question.id ? 'animate-pulse' : ''
              }`}
              onClick={() => setSelectedQuestion(question)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
                    {question.category}
                  </span>
                  <h3 className="text-lg font-medium mb-2">{question.text}</h3>
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    Answer in {question.unit}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveToPersonalDeck(question);
                  }}
                  className="text-primary-600 hover:text-primary-700 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  title="Add to collection"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;