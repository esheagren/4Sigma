import { supabase } from '../index.js';

export const calculateScore = (userAnswer, correctAnswer) => {
  const isCorrect = correctAnswer >= userAnswer.lowerBound && 
                   correctAnswer <= userAnswer.upperBound;
  
  if (!isCorrect) return 0;
  
  const interval = userAnswer.upperBound - userAnswer.lowerBound;
  const idealInterval = correctAnswer * 0.1;
  return Math.max(100 - Math.min(100, (interval / idealInterval) * 20), 0);
};

export const submitScore = async (req, res) => {
  const { userId, questionId, answer, score } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          user_id: userId,
          question_id: questionId,
          lower_bound: answer.lowerBound,
          upper_bound: answer.upperBound,
          score: score,
          submitted_at: new Date()
        }
      ]);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserStats = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('score, submitted_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    
    const stats = {
      totalGames: data.length,
      averageScore: data.reduce((acc, curr) => acc + curr.score, 0) / data.length,
      recentScores: data.slice(0, 10)
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};