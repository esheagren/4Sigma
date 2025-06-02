# Supabase Integration Guide

## Overview

This application has been updated to work with your Supabase schema. The integration includes:

- **Backend controllers** updated to work with the new schema structure
- **Frontend services** updated to use real API calls instead of mock data
- **New game session management** system using your schema
- **Type definitions** updated to match the database structure

## Database Schema

Your Supabase database should have the following tables (as provided):

- `users` - User profiles (linked to Supabase Auth)
- `categories` - Question categories
- `questions` - The questions with prompts and correct answers
- `question_categories` - Many-to-many relationship between questions and categories
- `game_sessions` - Individual game sessions
- `session_questions` - Questions included in each session
- `submissions` - User answers and scores
- `session_results` - Final results for completed sessions

## Setup Instructions

### 1. Database Setup

1. Run your provided schema in Supabase SQL Editor
2. Run the sample data script: `server/schema/sample_data.sql`

### 2. Environment Variables

Ensure your `.env` file has:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

### 3. Start the Application

```bash
# Start the backend server
npm run server

# In another terminal, start the frontend
npm run dev
```

## API Endpoints

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/daily` - Get daily questions
- `GET /api/questions/categories` - Get all categories
- `GET /api/questions?category=slug` - Get questions by category

### Game Sessions
- `POST /api/sessions` - Create a new game session
- `GET /api/sessions/:sessionId` - Get session with questions
- `POST /api/sessions/:sessionId/submit` - Submit an answer
- `POST /api/sessions/:sessionId/finish` - Finish a session
- `GET /api/sessions/user/:userId` - Get user's session history

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile

### Scores
- `GET /api/scores/stats/:userId` - Get user statistics

## Data Flow

### Game Session Flow
1. **Create Session**: Frontend calls `createGameSession()` with user ID and mode
2. **Get Questions**: Session includes questions based on mode (daily/practice/custom)
3. **Submit Answers**: Each answer is submitted via `submitAnswer()` and scored immediately
4. **Finish Session**: Call `finishGameSession()` to calculate final results

### Frontend Services
- `questionService.ts` - Handles question and category API calls
- `gameSessionService.ts` - Handles game session management
- `userService.ts` - Handles user profile operations

## Key Changes Made

### Backend
- Updated `questionController.js` to work with new schema (prompt vs text, correct_answer vs answer)
- Created `gameSessionController.js` for session management
- Updated `scoringController.js` to use submissions table
- Added proper joins to fetch categories with questions

### Frontend
- Replaced mock data with real API calls in `questionService.ts`
- Added new services for game sessions and users
- Updated types to match database schema
- Added support for game session workflow

## Testing

To test the integration:

1. Ensure your Supabase database has the schema and sample data
2. Start both backend and frontend servers
3. Navigate to the daily play page
4. The app should now fetch real questions from your database

## Notes

- The `unit` field is not in your schema but is expected by the frontend. You may want to add this field or modify the frontend to handle its absence.
- Daily questions currently return random questions. You may want to implement a proper daily question selection system.
- User authentication is not yet implemented. You'll need to add Supabase Auth integration for full user management.

## Next Steps

1. Add Supabase Auth integration for user authentication
2. Implement proper daily question rotation
3. Add the `unit` field to questions table if needed
4. Add error handling and loading states in the frontend
5. Implement user profile management 