# Mission Page Implementation

This document explains the new mission page implementation with split-screen layout, AI chat, and IDE functionality.

## Features

### Split-Screen Layout
- **Left Panel**: Chat interface with Codex AI mentor
- **Right Panel**: IDE with code editor, file management, and execution
- **Responsive Design**: Adapts to different screen sizes

### Chat Interface
- Real-time messaging with AI mentor using `/query` endpoint
- Message history with timestamps
- Auto-scroll to latest messages
- Loading states and error handling
- Integration with mission context and logs

### IDE Interface  
- **Monaco Editor**: Syntax highlighting for multiple languages
- **File Management**: Create, edit, and switch between files
- **Code Execution**: Run JavaScript code with output display
- **AI Integration**: Insert AI suggestions directly into code
- **Multi-language Support**: JavaScript, Python, TypeScript, HTML, CSS, JSON

### Mission Progress Tracking
- **Active Status**: JSONB field to track mission completion
- **Progress Indicators**: Visual status updates
- **Completion Tracking**: Mark missions as complete
- **Code Activity**: Track when users write code

## API Integration

### Backend Endpoint
- **URL**: `https://bepro-codex.onrender.com/query`
- **Method**: POST
- **Payload**:
  ```json
  {
    "input": "user query",
    "mission": "mission title",
    "logs": "previous logs",
    "history": "chat history"
  }
  ```
- **Response**:
  ```json
  {
    "session": "chat response",
    "ide": "code suggestions",
    "logs": "mission progress logs"
  }
  ```

## Database Schema

### Active Status Field
The `active_status` JSONB column stores mission progress:

```json
{
  "mission_name": {
    "completed": false,
    "completedAt": "ISO timestamp",
    "lastCodeUpdate": "ISO timestamp", 
    "logs": "mission progress notes",
    "demo": true
  }
}
```

### Migration
Run the migration script to add the field:
```sql
-- See database/add_active_status_migration.sql
```

## File Structure

```
src/app/codex/
├── [missions]/
│   └── page.js                 # Main mission page
├── components/
│   ├── ChatInterface.jsx       # AI chat component
│   └── IDEInterface.jsx        # Code editor component
└── lib/
    └── api.js                  # Backend API utilities
```

## Usage

### Demo Mode
When no user is authenticated, the mission page shows demo content:
- Sample mission: "JavaScript Fundamentals: Build a Todo App"
- Full functionality except database persistence
- Clearly marked as demo mode

### Authenticated Mode
With a logged-in user:
- Loads mission data from user's roadmap
- Saves progress to database
- Full AI integration with mission context

## Development

### Local Testing
```bash
npm run dev
# Navigate to http://localhost:3000/codex/test-mission
```

### Key Components
- **Mission Page**: `/src/app/codex/[missions]/page.js`
- **Chat Interface**: `/src/app/codex/components/ChatInterface.jsx`  
- **IDE Interface**: `/src/app/codex/components/IDEInterface.jsx`
- **API Utilities**: `/src/app/lib/api.js`

### Dependencies
- `@monaco-editor/react`: Code editor
- `@supabase/supabase-js`: Database client
- `zustand`: State management
- `tailwindcss`: Styling

## Error Handling

- **Network Errors**: Graceful fallback messages
- **API Failures**: Error states in chat
- **Loading States**: Spinners and skeleton screens
- **Demo Mode**: No database operations when not authenticated