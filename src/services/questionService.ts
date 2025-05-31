import { Question, Category } from '../types';

// Mock data for development
const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'What is the height of Mount Everest?',
    answer: 8849,
    unit: 'meters',
    category: 'Geography'
  },
  {
    id: '2',
    text: 'What is the average distance from Earth to the Moon?',
    answer: 384400,
    unit: 'kilometers',
    category: 'Science'
  },
  {
    id: '3',
    text: 'What is the population of Tokyo metropolitan area?',
    answer: 37400000,
    unit: 'people',
    category: 'Geography'
  },
  {
    id: '4',
    text: 'What is the average human body temperature?',
    answer: 37,
    unit: 'degrees Celsius',
    category: 'Science'
  },
  {
    id: '5',
    text: 'What was the GDP of Germany in 2022?',
    answer: 4.07,
    unit: 'trillion USD',
    category: 'Economics'
  },
  {
    id: '6',
    text: 'What is the wingspan of a Boeing 747?',
    answer: 68.5,
    unit: 'meters',
    category: 'Miscellaneous'
  }
];

const mockCategories: Category[] = [
  { 
    id: 'science', 
    name: 'Science', 
    description: 'Scientific facts and discoveries', 
    icon: 'flask' 
  },
  { 
    id: 'geography', 
    name: 'Geography', 
    description: 'Countries, cities, and landmarks', 
    icon: 'globe' 
  },
  { 
    id: 'economics', 
    name: 'Economics', 
    description: 'Markets, finance, and economic data', 
    icon: 'lineChart' 
  },
  { 
    id: 'misc', 
    name: 'Miscellaneous', 
    description: 'Various interesting numerical facts', 
    icon: 'brain' 
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getDailyQuestions = async (): Promise<Question[]> => {
  await delay(800);
  const randomQuestions = [...mockQuestions].sort(() => 0.5 - Math.random()).slice(0, 3);
  return randomQuestions;
};

export const getQuestions = async (): Promise<Question[]> => {
  await delay(800);
  return mockQuestions;
};

export const getQuestionsByCategory = async (categoryId: string): Promise<Question[]> => {
  await delay(800);
  const categoryName = mockCategories.find(c => c.id === categoryId)?.name || '';
  const filteredQuestions = mockQuestions.filter(
    q => q.category.toLowerCase() === categoryName.toLowerCase()
  );
  return filteredQuestions.length > 0 ? filteredQuestions : mockQuestions.slice(0, 3);
};

export const getCategories = async (): Promise<Category[]> => {
  await delay(600);
  return mockCategories;
};