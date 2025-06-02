import React, { useState, useEffect } from 'react';
import { Question, Category, QuestionWithCreator } from '../types';
import { getQuestionsWithCreators, getCategories, createQuestion, updateQuestion } from '../services/questionService';
import QuestionCreatorInfo from '../components/QuestionCreatorInfo';

const QuestionManagement: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionWithCreator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithCreator | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    prompt: '',
    correct_answer: '',
    category_ids: [] as number[]
  });

  // Mock current user - in a real app, this would come from auth context
  const currentUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    display_name: 'Test User'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsData, categoriesData] = await Promise.all([
          getQuestionsWithCreators(),
          getCategories()
        ]);
        setQuestions(questionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQuestion) {
        // Update existing question
        const updatedQuestion = await updateQuestion(editingQuestion.id, {
          prompt: formData.prompt,
          correct_answer: parseFloat(formData.correct_answer),
          category_ids: formData.category_ids,
          last_edited_by: currentUser.id
        });
        
        setQuestions(prev => prev.map(q => 
          q.id === editingQuestion.id 
            ? { ...updatedQuestion, creator: editingQuestion.creator, last_editor: { ...currentUser, created_at: '', avatar_url: '' } }
            : q
        ));
        setEditingQuestion(null);
      } else {
        // Create new question
        const newQuestion = await createQuestion({
          prompt: formData.prompt,
          correct_answer: parseFloat(formData.correct_answer),
          category_ids: formData.category_ids,
          created_by: currentUser.id
        });
        
        setQuestions(prev => [...prev, { 
          ...newQuestion, 
          creator: { ...currentUser, created_at: '', avatar_url: '' }
        }]);
        setShowCreateForm(false);
      }
      
      // Reset form
      setFormData({
        prompt: '',
        correct_answer: '',
        category_ids: []
      });
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const handleEdit = (question: QuestionWithCreator) => {
    setEditingQuestion(question);
    setFormData({
      prompt: question.text,
      correct_answer: question.answer.toString(),
      category_ids: [] // You'd need to fetch the current category IDs
    });
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingQuestion(null);
    setFormData({
      prompt: '',
      correct_answer: '',
      category_ids: []
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Question Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create New Question
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">
            {editingQuestion ? 'Edit Question' : 'Create New Question'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question Prompt</label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Correct Answer</label>
              <input
                type="number"
                step="any"
                value={formData.correct_answer}
                onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(parseInt(category.id))}
                      onChange={(e) => {
                        const categoryId = parseInt(category.id);
                        setFormData(prev => ({
                          ...prev,
                          category_ids: e.target.checked
                            ? [...prev.category_ids, categoryId]
                            : prev.category_ids.filter(id => id !== categoryId)
                        }));
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {editingQuestion ? 'Update Question' : 'Create Question'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-neutral-500 text-white px-4 py-2 rounded-lg hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">{question.text}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                  Answer: <span className="font-medium">{question.answer}</span>
                  {question.unit && <span className="ml-1">{question.unit}</span>}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-3">
                  Category: {question.category}
                </p>
                
                <QuestionCreatorInfo
                  creator={question.creator}
                  lastEditor={question.last_editor}
                  createdAt={question.created_at}
                  updatedAt={question.updated_at}
                  version={question.version}
                />
              </div>
              
              <button
                onClick={() => handleEdit(question)}
                className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionManagement; 