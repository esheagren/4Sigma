export interface Question {
  id: string;
  text: string;
  answer: number;
  unit: string;
  category: string;
}

export interface UserAnswer {
  questionId: string;
  lowerBound: number;
  upperBound: number;
  magnitude?: number;
  timestamp: string;
}

export interface QuestionResult {
  question: Question;
  userAnswer: UserAnswer;
  correct: boolean;
  points: number;
}

export interface GameResult {
  date: string;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  questionResults: QuestionResult[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}