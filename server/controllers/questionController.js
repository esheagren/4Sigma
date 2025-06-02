import { supabase } from '../index.js';

export const getQuestions = async (req, res) => {
  try {
    const { category, includeCreator } = req.query;
    
    let selectQuery = `
      id,
      prompt,
      correct_answer,
      version,
      created_at,
      updated_at,
      created_by,
      last_edited_by,
      question_categories (
        categories (
          id,
          slug,
          label
        )
      )
    `;

    // If includeCreator is true, also fetch creator and editor info
    if (includeCreator === 'true') {
      selectQuery = `
        id,
        prompt,
        correct_answer,
        version,
        created_at,
        updated_at,
        created_by,
        last_edited_by,
        creator:users!created_by (
          id,
          display_name,
          avatar_url
        ),
        last_editor:users!last_edited_by (
          id,
          display_name,
          avatar_url
        ),
        question_categories (
          categories (
            id,
            slug,
            label
          )
        )
      `;
    }

    let query = supabase
      .from('questions')
      .select(selectQuery)
      .limit(10);

    // Filter by category if provided
    if (category) {
      query = query.eq('question_categories.categories.slug', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedData = data.map(question => ({
      id: question.id.toString(),
      text: question.prompt,
      answer: question.correct_answer,
      unit: '', // You may want to add a unit field to your schema
      category: question.question_categories[0]?.categories?.label || 'General',
      version: question.version,
      created_by: question.created_by,
      last_edited_by: question.last_edited_by,
      created_at: question.created_at,
      updated_at: question.updated_at,
      creator: question.creator ? {
        id: question.creator.id,
        display_name: question.creator.display_name,
        avatar_url: question.creator.avatar_url
      } : null,
      last_editor: question.last_editor ? {
        id: question.last_editor.id,
        display_name: question.last_editor.display_name,
        avatar_url: question.last_editor.avatar_url
      } : null
    }));

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailyQuestions = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // For now, we'll get random questions since daily_questions table doesn't exist in your schema
    // You might want to add a daily_questions table or use game_sessions with mode='daily'
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        prompt,
        correct_answer,
        version,
        created_by,
        last_edited_by,
        created_at,
        updated_at,
        question_categories (
          categories (
            id,
            slug,
            label
          )
        )
      `)
      .limit(3);

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedData = data.map(question => ({
      id: question.id.toString(),
      text: question.prompt,
      answer: question.correct_answer,
      unit: '', // You may want to add a unit field to your schema
      category: question.question_categories[0]?.categories?.label || 'General',
      version: question.version,
      created_by: question.created_by,
      last_edited_by: question.last_edited_by,
      created_at: question.created_at,
      updated_at: question.updated_at
    }));

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('label');

    if (error) throw error;

    // Transform to match frontend expectations
    const transformedData = data.map(category => ({
      id: category.slug,
      name: category.label,
      description: `Questions about ${category.label.toLowerCase()}`,
      icon: 'brain' // Default icon, you might want to add an icon field to your schema
    }));

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  const { prompt, correct_answer, category_ids, created_by } = req.body;
  
  try {
    // Insert the question
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert([
        {
          prompt,
          correct_answer,
          created_by,
          version: 1
        }
      ])
      .select()
      .single();

    if (questionError) throw questionError;

    // Link question to categories
    if (category_ids && category_ids.length > 0) {
      const categoryLinks = category_ids.map(categoryId => ({
        question_id: questionData.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('question_categories')
        .insert(categoryLinks);

      if (categoryError) throw categoryError;
    }

    res.json({
      id: questionData.id.toString(),
      text: questionData.prompt,
      answer: questionData.correct_answer,
      version: questionData.version,
      created_by: questionData.created_by,
      created_at: questionData.created_at,
      updated_at: questionData.updated_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { prompt, correct_answer, category_ids, last_edited_by } = req.body;
  
  try {
    // Get current question to increment version
    const { data: currentQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('version')
      .eq('id', questionId)
      .single();

    if (fetchError) throw fetchError;

    // Update the question
    const updateData = {
      last_edited_by,
      version: currentQuestion.version + 1
    };

    if (prompt !== undefined) updateData.prompt = prompt;
    if (correct_answer !== undefined) updateData.correct_answer = correct_answer;

    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', questionId)
      .select()
      .single();

    if (questionError) throw questionError;

    // Update categories if provided
    if (category_ids) {
      // Remove existing category links
      await supabase
        .from('question_categories')
        .delete()
        .eq('question_id', questionId);

      // Add new category links
      if (category_ids.length > 0) {
        const categoryLinks = category_ids.map(categoryId => ({
          question_id: questionId,
          category_id: categoryId
        }));

        const { error: categoryError } = await supabase
          .from('question_categories')
          .insert(categoryLinks);

        if (categoryError) throw categoryError;
      }
    }

    res.json({
      id: questionData.id.toString(),
      text: questionData.prompt,
      answer: questionData.correct_answer,
      version: questionData.version,
      created_by: questionData.created_by,
      last_edited_by: questionData.last_edited_by,
      created_at: questionData.created_at,
      updated_at: questionData.updated_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuestionsByCreator = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        prompt,
        correct_answer,
        version,
        created_at,
        updated_at,
        created_by,
        last_edited_by,
        creator:users!created_by (
          id,
          display_name,
          avatar_url
        ),
        last_editor:users!last_edited_by (
          id,
          display_name,
          avatar_url
        ),
        question_categories (
          categories (
            id,
            slug,
            label
          )
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedData = data.map(question => ({
      id: question.id.toString(),
      text: question.prompt,
      answer: question.correct_answer,
      unit: '',
      category: question.question_categories[0]?.categories?.label || 'General',
      version: question.version,
      created_by: question.created_by,
      last_edited_by: question.last_edited_by,
      created_at: question.created_at,
      updated_at: question.updated_at,
      creator: question.creator,
      last_editor: question.last_editor
    }));

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};