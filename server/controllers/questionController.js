import { supabase } from '../index.js';

export const getQuestions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(10);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailyQuestions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('daily_questions')
      .select('question_id, date')
      .eq('date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};