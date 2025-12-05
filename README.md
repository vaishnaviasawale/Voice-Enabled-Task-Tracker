# Voice-Enabled Task Tracker

A full-stack task management application with voice input capabilities, user authentication, and email notifications. Users can create projects, manage tasks via Kanban board or list view, and create tasks using voice commands with intelligent date/priority parsing.

## Table of Contents

- [Features](#features)
- [Feature Breakdown](#feature-breakdown)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Email Configuration](#email-configuration)
  - [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Decisions and Assumptions](#decisions-and-assumptions)
- [AI Tools Usage](#ai-tools-usage)
- [Future Scope](#future-scope)

---

## Features

### 1. User Registration
Sign up with email and password. Password must meet security requirements: minimum 8 characters, uppercase, lowercase, number, and special character. Real-time validation feedback is provided.

![Sign Up Page](./screenshots/signUp.png)

### 2. User Login
Secure login with email and password. JWT-based authentication with 7-day token expiry.

![Sign In Page](./screenshots/signIn.png)

### 3. Home Page
View all your projects at a glance. First-time users see an empty state with a prompt to create their first project.

![Initial Home Page](./screenshots/initialHome.png)

### 4. Create Project
Create a new project with a name and optional description.

![Create Project](./screenshots/createProject.png)

### 5. Edit Project
Edit an existing project's name or description by clicking the edit icon on hover.

![Edit Project](./screenshots/editProject.png)

### 6. Delete Project
Delete a project with a confirmation warning. Deleting a project will also delete all tasks associated with it.

![Delete Project](./screenshots/deleteProject.png)

### 7. Project List
All projects are displayed with their task count. Hover over a project card to reveal edit and delete options.

![Project View](./screenshots/projectView.png)

### 8. Project Dashboard
Click on a project to enter the project view. Default view is the Kanban board style. Add and manage tasks from here. You can also go back to the Project List view using the "Back to Projects" button.

![Project Home](./screenshots/initialProjectHome.png)

### 9. Voice Task Creation
Create tasks using voice commands. The system:
- Transcribes your speech and displays it for verification
- Intelligently extracts task details from natural language
- Understands relative dates like "tomorrow", "next Monday", "in 3 days"
- Detects priority keywords like "urgent", "high priority", "critical"
- Defaults to "TO DO" status and "MEDIUM" priority if not specified
- Allows editing before final creation

**Example:** "Remind me to send the project proposal to the client by next Wednesday, it's high priority"

![Voice Input](./screenshots/voiceInput.png)

### 10. Manual Task Creation
Create tasks manually with full control over all fields: title, description, status, priority, and due date.

![Create Task](./screenshots/createTask.png)

### 11. Edit Task
Click on any task to view and edit its details. The last updated timestamp is displayed on the task.

![Edit Task](./screenshots/editTask.png)

### 12. Delete Task
Delete tasks with a confirmation prompt to prevent accidental deletion.

![Delete Task](./screenshots/deleteTask.png)

### 13. Search and Filter
Search tasks by keywords in title or description. Filter by one or more criteria:
- Status (To Do, In Progress, Done)
- Priority (Low, Medium, High)
- Due Date (Overdue, Today, This Week, No Date)

![Search Feature](./screenshots/searchFeature.png)

### 14. Kanban Board View
Default view with drag-and-drop functionality. Move tasks between columns (To Do, In Progress, Done) by dragging. Touch support available for mobile devices.

![Board View](./screenshots/boardView.png)

### 15. List View
Alternative table view showing all task details in a structured format. Click on any row to view/edit the task.

![List View](./screenshots/listView.png)

### 16. Overdue Indicators and Quick Status Change
Tasks with past due dates are highlighted in red in both views. Click on a task to quickly change its status using the "Move to" buttons.

![Task View](./screenshots/taskView.png)

### 17. Email Notifications
Automated email notifications are sent via Mailtrap for:
- Task created
- Task updated (with list of changes)
- Task status changed
- Task deleted

![Emails Sent](./screenshots/emailsSent.png)

### 18. Responsive Design
The application is fully responsive and works on mobile devices. The Kanban board supports touch-based drag-and-drop for moving tasks between columns on tablets and phones.

![Responsive Design](./screenshots/responsiveDesign.png)

---

## Feature Breakdown

### Task Management
- Create, Read, Update, Delete tasks
- Fields: Title, Description, Due Date, Priority, Status
- Priority levels: LOW, MEDIUM, HIGH
- Status options: TODO, IN_PROGRESS, DONE
- Timestamps: createdAt, updatedAt

### Project Management
- Create, Edit, Delete projects
- Each project contains multiple tasks
- Projects are user-scoped (each user sees only their projects)
- Cascade delete (deleting project removes all its tasks)

### User Authentication
- User registration with email/password
- Password hashing with bcrypt
- JWT-based authentication (7-day token expiry)
- Protected routes - users can only access their own data
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)

### Views
- **Kanban Board View**: Drag-and-drop tasks between columns
- **List View**: Table format with all task details
- Responsive design with touch support for mobile

### Voice Input
- Microphone button to start/stop recording
- Local speech-to-text using Whisper model
- Intelligent NLP parsing for dates using chrono-node
- Extracts: Title, Due Date, Priority from spoken text
- Recognizes relative dates: "tomorrow", "next Monday", "in 3 days"
- Detects priority keywords: "urgent", "high priority", "critical"
- Preview modal to review/edit before creating task

### Search and Filtering
- Search tasks by title or description
- Filter by Status, Priority, Due Date
- Clear all filters button

### Email Notifications
- Task Created, Updated, Deleted notifications
- Status change notifications
- HTML email templates via Mailtrap

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router v6 | Routing |
| React Context API | State Management |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| Drizzle ORM | Database ORM |
| SQLite | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Nodemailer | Email Service |

### Voice Processing
| Technology | Purpose |
|------------|---------|
| @xenova/transformers | Local Whisper Model |
| chrono-node | Date Parsing |
| ffmpeg-static | Audio Conversion |

---

## Getting Started

### Prerequisites

| Requirement | Version/Details |
|-------------|-----------------|
| Node.js | v18.0.0 or higher |
| npm | v9.0.0 or higher (comes with Node.js) |
| Git | For cloning the repository |
| Browser | Chrome/Firefox recommended (for voice features) |

**No external database required** - SQLite is used as a file-based database, created automatically.

**No API keys required for core functionality** - Voice transcription runs locally using the Whisper model. Email notifications are optional (requires free Mailtrap account).

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend folder:
   ```env
   PORT=5000
   JWT_SECRET=your-secret-key-here-change-in-production
   
   # For email notifications (sign up at https://mailtrap.io)
   MAILTRAP_USER=your-mailtrap-username
   MAILTRAP_PASS=your-mailtrap-password
   ```

4. Initialize the database:
   ```bash
   npx drizzle-kit push
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

### Email Configuration

Email notifications are **optional**. Without configuration, the app works fully but skips sending emails.

To enable email notifications:

1. Sign up for a free account at [Mailtrap.io](https://mailtrap.io)
2. Go to **Email Testing** → **Inboxes** → Click your inbox
3. Select **SMTP Settings** tab → **Show Credentials**
4. Copy the username and password to your `.env` file:
   ```env
   MAILTRAP_USER=your-mailtrap-username
   MAILTRAP_PASS=your-mailtrap-password
   ```

Mailtrap is a sandbox email service - all emails are captured in your Mailtrap inbox for viewing, not sent to real email addresses. This is ideal for development and demos.

### Running Locally

1. Start the backend server (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

**Note:** The database is created automatically on first run. No seed data is required - simply register a new user and start creating projects and tasks.

### Voice Commands

The voice feature uses your browser's microphone. On first use, allow microphone access when prompted. The Whisper model downloads automatically on first use (~50MB).

**Example voice commands:**
- "Remind me to send the project proposal to the client by next Wednesday, high priority"
- "Review code changes, urgent, by December 13th"
- "Call the team tomorrow morning"

---

## Database Schema

### Users Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| email | TEXT | NOT NULL, UNIQUE |
| password | TEXT | NOT NULL (hashed) |
| name | TEXT | NOT NULL |
| created_at | INTEGER | Unix timestamp |

### Projects Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| name | TEXT | NOT NULL |
| description | TEXT | DEFAULT "" |
| user_id | INTEGER | FK -> users.id, NOT NULL |
| created_at | INTEGER | Unix timestamp |

### Tasks Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| title | TEXT | NOT NULL |
| description | TEXT | DEFAULT "" |
| priority | TEXT | DEFAULT "MEDIUM" |
| status | TEXT | DEFAULT "TODO" |
| due_date | INTEGER | NULLABLE, Unix timestamp |
| project_id | INTEGER | FK -> projects.id |
| created_at | INTEGER | Unix timestamp |
| updated_at | INTEGER | Unix timestamp |

### Enums
- **Priority**: LOW, MEDIUM, HIGH
- **Status**: TODO, IN_PROGRESS, DONE

### Relationships
- User (1) -> Projects (Many)
- Project (1) -> Tasks (Many)

---

## API Documentation

Base URL: `http://localhost:5000`

All protected routes require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": { "id": 1, "email": "john@example.com", "name": "John Doe" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (400):**
```json
{
  "error": "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, one special character"
}
```

#### POST /auth/login
Login an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": { "id": 1, "email": "john@example.com", "name": "John Doe" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

### Project Endpoints (Protected)

#### GET /projects
Get all projects for the authenticated user.

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "My Project",
    "description": "Project description",
    "userId": 1,
    "createdAt": 1733400000,
    "tasks": [...]
  }
]
```

#### POST /projects
Create a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Optional description"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "name": "New Project",
  "description": "Optional description",
  "userId": 1,
  "createdAt": 1733400000,
  "tasks": []
}
```

#### DELETE /projects/:id
Delete a project and all its tasks.

**Success Response (200):**
```json
{
  "message": "Project and all associated tasks deleted",
  "project": { "id": 1, "name": "Deleted Project" },
  "tasksDeleted": 5
}
```

### Task Endpoints (Protected)

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Complete report",
  "description": "Finish the quarterly report",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": 1733486400,
  "projectId": 1
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "title": "Complete report",
  "description": "Finish the quarterly report",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": 1733486400,
  "projectId": 1,
  "createdAt": 1733400000,
  "updatedAt": 1733400000
}
```

#### PUT /tasks/:id
Update a task.

**Request Body (partial update supported):**
```json
{
  "status": "IN_PROGRESS"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Complete report",
  "status": "IN_PROGRESS",
  "updatedAt": 1733410000
}
```

### Voice Endpoint (Protected)

#### POST /voice/transcribe
Upload audio and receive transcript with parsed task details.

**Request:** `multipart/form-data` with `audio` file field

**Success Response (200):**
```json
{
  "transcript": "Remind me to call the client tomorrow high priority",
  "task": {
    "title": "Call the client",
    "description": "",
    "priority": "HIGH",
    "status": "TODO",
    "dueDate": 1733572800
  }
}
```

**Error Response (400):**
```json
{
  "error": "No audio file provided"
}
```

---

## Decisions and Assumptions

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite over PostgreSQL/MySQL** | Simpler setup, no external DB server needed, perfect for single-user/demo scenarios. File-based storage makes it easy to reset and share. |
| **Local Whisper model over cloud API** | Free, no API keys required, works offline. Trade-off: ~50MB model download on first use. |
| **JWT over session-based auth** | Stateless authentication, easier to scale, works well with React SPA. |
| **Drizzle ORM over raw SQL** | Type-safe queries, easy schema migrations, lightweight compared to Sequelize/TypeORM. |
| **Unix timestamps over ISO dates** | Consistent storage format, timezone-agnostic, easy arithmetic operations. |
| **Context API over Redux** | Sufficient for this app's complexity, less boilerplate, built into React. |
| **Mailtrap over real SMTP** | Safe for development/demos, no risk of spamming real emails, free tier available. |
| **chrono-node for date parsing** | Robust NLP date parsing, handles relative dates ("tomorrow", "next Monday") well. |

### Assumptions

| Assumption | Details |
|------------|---------|
| **Single user per browser** | JWT stored in localStorage; no multi-account switching support. |
| **English voice input** | Whisper model and chrono-node optimized for English language. |
| **Modern browser required** | Uses MediaRecorder API for voice recording (Chrome/Firefox recommended). |
| **Email addresses are valid** | No email verification implemented; users can register with any email format. |
| **Due dates are optional** | Tasks can exist without due dates; defaults to null if not specified. |
| **Project required for tasks** | Every task must belong to a project; no orphan tasks allowed. |
| **No real-time collaboration** | Single-user access to projects; no WebSocket-based live updates. |
| **Cascade delete is intentional** | Deleting a project removes all associated tasks permanently. |

---

## AI Tools Usage

### Tools Used

| Tool | Purpose |
|------|---------|
| **Cursor IDE with Claude** | Primary development assistant for code generation and debugging|

### What AI Helped With

1. **Boilerplate & Setup**
   - Express.js server configuration
   - Drizzle ORM schema setup
   - React Context API patterns
   - Tailwind CSS component styling

2. **Feature Implementation**
   - Voice-to-text integration with Whisper
   - NLP date parsing logic
   - Drag-and-drop functionality for Kanban board
   - JWT authentication flow
   - Email notification templates

3. **Debugging & Problem Solving**
   - React hook dependency issues
   - CORS configuration
   - Audio format conversion (WebM to WAV)
   - State management across components

4. **Code Architecture**
   - MVC pattern for backend (routes → controllers → services)
   - Context providers for frontend state
   - Component hierarchy decisions

### Notable Approaches

- **Design-prioritise first**: Started with designing only what is required/
  deciding a basic schema first. After that implementation, more features were
  added
- **Iterative development**: Started with basic CRUD, added features incrementally based on requirements
- **Local-first**: Chose free/local alternatives (Whisper, SQLite) over paid cloud services
- **User feedback integration**: Real-time password validation, voice transcript preview before task creation

---

## Future Scope

- Assignee/Reporter fields on tasks
- Task dependencies (Depends On, Blocked By)
- Team/workspace shared collaboration
- Unit tests
- Task attachments
- Add tags to group similar tasks

---

## Notes

- All timestamps are stored as Unix timestamps (seconds since epoch)
- Passwords are hashed using bcrypt with salt rounds = 10
- SQLite doesn't support native enums, so priority/status are stored as TEXT
- Cascade delete is implemented in application code
- JWT tokens expire after 7 days
- Due dates are optional and default to null if not specified
- The Ideation folder in this repo contains the initial design thought process
- A `.env.example` file is provided in the backend folder with all required
  environment variables
- All APIs have been tested used Postman
- The voice input feature works has been tested to work in Google Chrome and
  Mozilla Firefox
