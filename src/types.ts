export interface Question {
  id: string;
  text: string;
  answer: number;
  unit: string;
  category: string;
  version?: number;
  created_by?: string;
  last_edited_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAnswer {
  questionId: string;
  lowerBound: number;
  upperBound: number;
  magnitude?: number;
  timestamp: string;
  elapsedMs?: number;
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

// New types for the updated schema
export interface User {
  id: string;
  display_name: string;
  created_at: string;
  avatar_url?: string;
}

export interface GameSession {
  id: number;
  user_id: string;
  mode: 'daily' | 'custom' | 'practice';
  started_at: string;
  questions?: Question[];
}

export interface Submission {
  id: number;
  session_id: number;
  question_id: number;
  user_id: string;
  lower_bound: number;
  upper_bound: number;
  elapsed_ms?: number;
  score: number;
  created_at: string;
  correct_answer?: number;
}

export interface SessionResult {
  session_id: number;
  total_score: number;
  questions_answered: number;
  finished_at: string;
  duration_ms?: number;
}

// New types for question management
export interface CreateQuestionRequest {
  prompt: string;
  correct_answer: number;
  category_ids: number[];
  created_by: string;
}

export interface UpdateQuestionRequest {
  prompt?: string;
  correct_answer?: number;
  category_ids?: number[];
  last_edited_by: string;
}

export interface QuestionWithCreator extends Question {
  creator?: User;
  last_editor?: User;
}