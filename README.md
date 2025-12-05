# Voice-Enabled Task Tracker

A full-stack task management application with voice input capabilities, user authentication, and email notifications. Users can create projects, manage tasks via Kanban board or list view, and create tasks using voice commands with intelligent date/priority parsing.

## Table of Contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Future Scope](#future-scope)

---

## Features

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

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Git

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

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Register a new account
3. Create your first project
4. Start adding tasks

### Voice Commands

The voice feature uses your browser's microphone. On first use, allow microphone access when prompted. The Whisper model downloads automatically on first use (~50MB).

**Example voice commands:**
- "Remind me to send the project proposal to the client by next Wednesday, high priority"
- "Review code changes, urgent, by December 13th"
- "Call the team tomorrow morning"

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

### Projects (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | Get all projects for user |
| GET | `/projects/:id` | Get single project with tasks |
| POST | `/projects` | Create new project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project (cascades to tasks) |

### Tasks (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (with filters) |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

### Voice (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/voice/transcribe` | Upload audio, returns transcript + parsed task |

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

## Future Scope

- Assignee/Reporter fields on tasks
- Task dependencies (Depends On, Blocked By)
- Team/workspace collaboration
- Unit tests
- Task attachments
- Due date reminders

---

## Notes

- All timestamps are stored as Unix timestamps (seconds since epoch)
- Passwords are hashed using bcrypt with salt rounds = 10
- SQLite doesn't support native enums, so priority/status are stored as TEXT
- Cascade delete is implemented in application code
- JWT tokens expire after 7 days
- Due dates are optional and default to null if not specified
- The Ideation folder in this repo contains the initial design though process
