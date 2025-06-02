import { Question, Category, CreateQuestionRequest, UpdateQuestionRequest, QuestionWithCreator } from '../types';

// Environment-aware API configuration
const getApiBaseUrl = () => {
  // Always use relative path to leverage Vite's proxy
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔧 API Configuration:', {
  isDev: import.meta.env.DEV,
  apiBaseUrl: API_BASE_URL,
  mode: import.meta.env.MODE
});

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText} for URL: ${response.url}`);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const getDailyQuestions = async (): Promise<Question[]> => {
  const url = `${API_BASE_URL}/questions/daily`;
  console.log('🔍 Constructing URL for daily questions:', url);
  console.log('🔍 API_BASE_URL:', API_BASE_URL);
  
  try {
    const response = await fetch(url);
    console.log('✅ Response received for daily questions:', response.url, response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Error fetching daily questions:', error);
    throw error;
  }
};

export const getQuestions = async (includeCreator: boolean = false): Promise<Question[]> => {
  const url = includeCreator 
    ? `${API_BASE_URL}/questions?includeCreator=true`
    : `${API_BASE_URL}/questions`;
  console.log('🔍 Constructing URL for questions:', url);
  
  try {
    const response = await fetch(url);
    console.log('✅ Response received for questions:', response.url, response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Error fetching questions:', error);
    throw error;
  }
};

export const getQuestionsWithCreators = async (): Promise<QuestionWithCreator[]> => {
  const url = `${API_BASE_URL}/questions?includeCreator=true`;
  console.log('🔍 Constructing URL for questions with creators:', url);
  
  try {
    const response = await fetch(url);
    console.log('✅ Response received for questions with creators:', response.url, response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Error fetching questions with creators:', error);
    throw error;
  }
};

export const getQuestionsByCategory = async (categoryId: string): Promise<Question[]> => {
  const url = `${API_BASE_URL}/questions?category=${categoryId}`;
  console.log('🔍 Constructing URL for questions by category:', url);
  
  try {
    const response = await fetch(url);
    console.log('✅ Response received for questions by category:', response.url, response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Error fetching questions by category:', error);
    throw error;
  }
};

export const getQuestionsByCreator = async (userId: string): Promise<QuestionWithCreator[]> => {
  const url = `${API_BASE_URL}/questions/creator/${userId}`;
  console.log('🔍 Constructing URL for questions by creator:', url);
  
  try {
    const response = await fetch(url);
    console.log('✅ Response received for questions by creator:', response.url, response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Error fetching questions by creator:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  const url = `${API_BASE_URL}/questions/categories`;
  console.log('🔍 Constructing URL for categories:', url);
  
  try {
    const response = await fetch(url);
    console.log('✅ Response received for categories:', response.url, response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw error;
  }
};

export const createQuestion = async (questionData: CreateQuestionRequest): Promise<Question> => {
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  });
  return handleResponse(response);
};

export const updateQuestion = async (
  questionId: string, 
  updateData: UpdateQuestionRequest
): Promise<Question> => {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  return handleResponse(response);
};