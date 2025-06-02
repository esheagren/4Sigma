# Question Creator and Editor Tracking Features

## Overview

This update adds comprehensive tracking of question creators and editors, including version control and audit trails for all question modifications.

## Database Changes

### New Columns Added to `questions` table:
- `created_by` (UUID) - References the user who created the question
- `last_edited_by` (UUID) - References the user who last edited the question
- Automatic timestamp updates via trigger when questions are modified

### Migration Script
Run `server/schema/add_question_tracking.sql` after your main schema is set up.

## New Features

### 1. Question Creator Tracking
- Every question now tracks who created it
- Creator information is displayed in the UI
- Questions can be filtered by creator

### 2. Version Control
- Questions automatically increment version numbers when edited
- Version 1 = original question (only `created_by` is set)
- Version 2+ = edited questions (`last_edited_by` is set)
- Visual indicators show when questions have been edited

### 3. Edit History
- Track who last edited each question
- Display creation and last edit timestamps
- Show both creator and editor information when different

### 4. Question Management Interface
- New `/questions` page for managing questions
- Create new questions with category assignment
- Edit existing questions (increments version)
- View all questions with creator/editor information

## API Endpoints

### New Endpoints:
- `POST /api/questions` - Create a new question
- `PUT /api/questions/:questionId` - Update an existing question
- `GET /api/questions/creator/:userId` - Get questions by creator
- `GET /api/questions?includeCreator=true` - Get questions with creator info

### Updated Endpoints:
- `GET /api/questions` - Now includes creator/editor fields
- `GET /api/questions/daily` - Now includes creator/editor fields

## Frontend Components

### New Components:
1. **QuestionCreatorInfo** - Displays creator and editor information
2. **QuestionManagement** - Full CRUD interface for questions

### Updated Components:
- **Header** - Added "Questions" navigation link
- **App** - Added route for question management

## Data Flow

### Creating a Question:
1. User fills out form in QuestionManagement page
2. Frontend calls `createQuestion()` service
3. Backend creates question with `created_by` set to current user
4. Version is set to 1
5. Question is linked to selected categories

### Editing a Question:
1. User clicks "Edit" on existing question
2. Form is pre-populated with current values
3. Frontend calls `updateQuestion()` service
4. Backend increments version number
5. Sets `last_edited_by` to current user
6. Updates `updated_at` timestamp via trigger

### Viewing Questions:
1. Questions can be fetched with or without creator information
2. `includeCreator=true` parameter joins user data
3. Creator and editor information is displayed in UI
4. Version indicators show edit status

## Types and Interfaces

### New TypeScript Types:
```typescript
interface CreateQuestionRequest {
  prompt: string;
  correct_answer: number;
  category_ids: number[];
  created_by: string;
}

interface UpdateQuestionRequest {
  prompt?: string;
  correct_answer?: number;
  category_ids?: number[];
  last_edited_by: string;
}

interface QuestionWithCreator extends Question {
  creator?: User;
  last_editor?: User;
}
```

### Updated Question Interface:
```typescript
interface Question {
  // ... existing fields
  created_by?: string;
  last_edited_by?: string;
  created_at?: string;
  updated_at?: string;
  version?: number;
}
```

## Usage Examples

### Creating a Question:
```typescript
const newQuestion = await createQuestion({
  prompt: "What is the speed of light?",
  correct_answer: 299792458,
  category_ids: [1], // Science category
  created_by: currentUser.id
});
```

### Updating a Question:
```typescript
const updatedQuestion = await updateQuestion("123", {
  prompt: "What is the speed of light in vacuum?",
  last_edited_by: currentUser.id
});
```

### Getting Questions with Creator Info:
```typescript
const questionsWithCreators = await getQuestionsWithCreators();
```

## UI Features

### Question Display:
- Shows creator name and avatar
- Shows creation date and time
- Shows last editor (if different from creator)
- Shows last edit date and time
- Version badge with "Edited" indicator for v2+

### Question Management:
- Create new questions with category selection
- Edit existing questions (preserves creator, updates editor)
- View all questions in a list with full metadata
- Form validation and error handling

## Security Considerations

- User IDs are validated against existing users
- Only authenticated users can create/edit questions
- Edit history is immutable (no deletion of audit trail)
- Version numbers always increment (no rollback)

## Future Enhancements

1. **Full Edit History**: Track all edits, not just the last one
2. **Question Approval Workflow**: Require approval for edits
3. **Collaborative Editing**: Multiple editors with conflict resolution
4. **Question Comments**: Allow discussion on questions
5. **Advanced Permissions**: Role-based question management

## Testing

To test the new features:

1. Run the migration script in Supabase
2. Navigate to `/questions` in the app
3. Create a new question
4. Edit an existing question
5. Verify creator/editor information displays correctly
6. Check that version numbers increment properly

## Notes

- The current implementation uses a mock user for demonstration
- In production, integrate with Supabase Auth for real user management
- Consider adding user avatars and display names to enhance the UI
- The category selection in edit mode needs to fetch current categories 