import { Question, Category, CreateQuestionRequest, UpdateQuestionRequest, QuestionWithCreator } from '../types';

const API_BASE_URL = '/api';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const getDailyQuestions = async (): Promise<Question[]> => {
  const response = await fetch(`${API_BASE_URL}/questions/daily`);
  return handleResponse(response);
};

export const getQuestions = async (includeCreator: boolean = false): Promise<Question[]> => {
  const url = includeCreator 
    ? `${API_BASE_URL}/questions?includeCreator=true`
    : `${API_BASE_URL}/questions`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const getQuestionsWithCreators = async (): Promise<QuestionWithCreator[]> => {
  const response = await fetch(`${API_BASE_URL}/questions?includeCreator=true`);
  return handleResponse(response);
};

export const getQuestionsByCategory = async (categoryId: string): Promise<Question[]> => {
  const response = await fetch(`${API_BASE_URL}/questions?category=${categoryId}`);
  return handleResponse(response);
};

export const getQuestionsByCreator = async (userId: string): Promise<QuestionWithCreator[]> => {
  const response = await fetch(`${API_BASE_URL}/questions/creator/${userId}`);
  return handleResponse(response);
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/questions/categories`);
  return handleResponse(response);
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