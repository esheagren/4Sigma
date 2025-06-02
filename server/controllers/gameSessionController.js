import { supabase } from '../index.js';
import { calculateScore } from './scoringController.js';

/**
 * Create a new game session
 */
export const createGameSession = async (req, res) => {
  const { userId, mode, questionIds } = req.body;
  
  try {
    // Create the game session
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .insert([
        {
          user_id: userId,
          mode: mode || 'practice'
        }
      ])
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Add questions to the session
    if (questionIds && questionIds.length > 0) {
      const sessionQuestions = questionIds.map((questionId, index) => ({
        session_id: sessionData.id,
        question_id: questionId,
        order_idx: index
      }));

      const { error: questionsError } = await supabase
        .from('session_questions')
        .insert(sessionQuestions);

      if (questionsError) throw questionsError;
    }

    res.json(sessionData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a game session with its questions
 */
export const getGameSession = async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        session_questions (
          order_idx,
          questions (
            id,
            prompt,
            correct_answer,
            question_categories (
              categories (
                label
              )
            )
          )
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    // Transform questions to match frontend expectations
    const transformedSession = {
      ...data,
      questions: data.session_questions
        .sort((a, b) => a.order_idx - b.order_idx)
        .map(sq => ({
          id: sq.questions.id.toString(),
          text: sq.questions.prompt,
          answer: sq.questions.correct_answer,
          unit: '', // You may want to add this to your schema
          category: sq.questions.question_categories[0]?.categories?.label || 'General'
        }))
    };

    delete transformedSession.session_questions;
    res.json(transformedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Submit an answer for a question in a session
 */
export const submitAnswer = async (req, res) => {
  const { sessionId, questionId, userId, lowerBound, upperBound, elapsedMs } = req.body;
  
  try {
    // Get the correct answer for scoring
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('correct_answer')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;

    // Calculate the score
    const score = calculateScore({
      lowerBound,
      upperBound,
      correctAnswer: questionData.correct_answer
    });

    // Insert the submission
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          session_id: sessionId,
          question_id: questionId,
          user_id: userId,
          lower_bound: lowerBound,
          upper_bound: upperBound,
          elapsed_ms: elapsedMs,
          score
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...data,
      correct_answer: questionData.correct_answer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Finish a game session and calculate results
 */
export const finishGameSession = async (req, res) => {
  const { sessionId } = req.params;
  const { durationMs } = req.body;
  
  try {
    // Get all submissions for this session
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('score')
      .eq('session_id', sessionId);

    if (submissionsError) throw submissionsError;

    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const questionsAnswered = submissions.length;

    // Insert session results
    const { data, error } = await supabase
      .from('session_results')
      .insert([
        {
          session_id: sessionId,
          total_score: totalScore,
          questions_answered: questionsAnswered,
          finished_at: new Date(),
          duration_ms: durationMs
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...data,
      submissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's game session history
 */
export const getUserSessions = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        session_results (
          total_score,
          questions_answered,
          finished_at,
          duration_ms
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 