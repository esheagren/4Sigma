import { supabase } from '../index.js';

/**
 * Calculate the score using KL divergence-inspired scoring system
 * @param {Object} params
 * @param {number} params.lowerBound - Lower bound of confidence interval
 * @param {number} params.upperBound - Upper bound of confidence interval
 * @param {number} params.correctAnswer - The actual correct answer
 * @returns {number} Score between 0 and 100
 */
export const calculateScore = ({ lowerBound, upperBound, correctAnswer }) => {
  // Handle edge cases
  if (lowerBound <= 0) lowerBound = 1e-15; // Avoid log(0)
  if (upperBound <= 0) upperBound = 1e-15;
  if (correctAnswer <= 0) correctAnswer = 1e-15;

  // Work in log space to handle large numbers better
  const logLower = Math.log(lowerBound);
  const logUpper = Math.log(upperBound);
  const logX = Math.log(correctAnswer);

  // Calculate penalty based on interval width and correctness
  const intervalWidth = logUpper - logLower;
  const normalizedPosition = (logX - logLower) / intervalWidth;

  // Base penalty from KL divergence formula
  let penalty = Math.log(intervalWidth / 4) + 
                2 * Math.pow((logX - (logLower + logUpper) / 2) / intervalWidth, 2);

  // Add extra penalty if answer is outside the interval
  if (normalizedPosition < 0 || normalizedPosition > 1) {
    const distanceOutside = Math.min(Math.abs(normalizedPosition), Math.abs(normalizedPosition - 1));
    penalty += 5 * distanceOutside;
  }

  // Transform penalty into a 0-100 score
  // Add 1.1 to avoid negative infinity when penalty is very small
  const rawScore = 100 * Math.exp(-penalty - 1.1);
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, rawScore));
};

/**
 * Submit a score to the database
 */
export const submitScore = async (req, res) => {
  const { userId, questionId, answer, correctAnswer } = req.body;
  
  try {
    const score = calculateScore({
      lowerBound: answer.lowerBound,
      upperBound: answer.upperBound,
      correctAnswer
    });

    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          user_id: userId,
          question_id: questionId,
          lower_bound: answer.lowerBound,
          upper_bound: answer.upperBound,
          correct_answer: correctAnswer,
          score,
          submitted_at: new Date()
        }
      ]);

    if (error) throw error;
    
    res.json({
      score,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user statistics including score distribution
 */
export const getUserStats = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('scores')
      .select(`
        score,
        lower_bound,
        upper_bound,
        correct_answer,
        submitted_at,
        questions (
          text,
          unit
        )
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalAttempts: data.length,
      averageScore: data.reduce((acc, curr) => acc + curr.score, 0) / data.length || 0,
      scoreDistribution: {
        excellent: data.filter(s => s.score >= 90).length,
        good: data.filter(s => s.score >= 70 && s.score < 90).length,
        fair: data.filter(s => s.score >= 50 && s.score < 70).length,
        poor: data.filter(s => s.score < 50).length
      },
      recentScores: data.slice(0, 10).map(score => ({
        score: score.score,
        date: score.submitted_at,
        question: score.questions.text,
        unit: score.questions.unit,
        interval: [score.lower_bound, score.upper_bound],
        correctAnswer: score.correct_answer
      }))
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};