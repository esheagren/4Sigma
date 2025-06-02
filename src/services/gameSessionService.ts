import { GameSession, Submission, SessionResult } from '../types';

const API_BASE_URL = '/api';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const createGameSession = async (
  userId: string, 
  mode: 'daily' | 'custom' | 'practice', 
  questionIds?: number[]
): Promise<GameSession> => {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      mode,
      questionIds
    }),
  });
  return handleResponse(response);
};

export const getGameSession = async (sessionId: number): Promise<GameSession> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
  return handleResponse(response);
};

export const submitAnswer = async (
  sessionId: number,
  questionId: number,
  userId: string,
  lowerBound: number,
  upperBound: number,
  elapsedMs?: number
): Promise<Submission> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      questionId,
      userId,
      lowerBound,
      upperBound,
      elapsedMs
    }),
  });
  return handleResponse(response);
};

export const finishGameSession = async (
  sessionId: number,
  durationMs?: number
): Promise<SessionResult> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/finish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      durationMs
    }),
  });
  return handleResponse(response);
};

export const getUserSessions = async (userId: string): Promise<GameSession[]> => {
  const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`);
  return handleResponse(response);
}; 