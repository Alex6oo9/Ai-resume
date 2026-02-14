# AI Resume Builder - Setup, Run & Test Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Initial Setup](#initial-setup)
- [Running the Application](#running-the-application)
- [Using the Application](#using-the-application)
- [Testing](#testing)
- [Project Architecture](#project-architecture)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

| Tool       | Version  | Purpose                        |
|------------|----------|--------------------------------|
| Node.js    | >= 18.x  | JavaScript runtime             |
| npm        | >= 9.x   | Package manager                |
| PostgreSQL | >= 14.x  | Database                       |
| Git        | >= 2.x   | Version control                |
| Chromium   | Latest   | Required by Puppeteer for PDF generation (auto-downloaded) |

You will also need an **OpenAI API key** with access to GPT-4o-mini.

---

## Project Overview

AI Resume Builder is a full-stack web application that helps fresh graduates create ATS-optimized resumes. It provides two paths:

- **Path A (Upload):** Upload an existing PDF resume for AI-powered analysis, ATS scoring, and improvement suggestions.
- **Path B (Build):** Fill out a 7-step form and let AI generate a professional resume from scratch.

Both paths produce a match percentage, strengths/weaknesses analysis, and exportable PDF/Markdown output.

**Tech Stack:**
- Frontend: React 18 + TypeScript + TailwindCSS + Vite
- Backend: Node.js + Express 4 + TypeScript
- Database: PostgreSQL (sessions + data)
- Auth: Passport.js (local strategy, session-based)
- AI: OpenAI API (GPT-4o-mini)
- PDF Parsing: pdf-parse v2
- PDF Generation: Puppeteer
- Testing: Jest (backend), Vitest + Testing Library (frontend)

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "AI resume"
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database — update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_resume_builder

# Session — use a strong random string in production
SESSION_SECRET=your-session-secret-change-this

# OpenAI — your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 3. Create the Database

Connect to PostgreSQL and create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE ai_resume_builder;
\q
```

### 4. Install Dependencies

Install backend and frontend dependencies:

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Run Database Migrations

From the project root:

```bash
cd server
npm run migrate
```

This creates the following tables:
- `users` — user accounts
- `session` — session storage for Passport.js
- `resumes` — resume records with AI analysis
- `resume_data` — form data for resumes built from scratch
- `migrations` — migration tracking

### 6. Create Upload Directory

The server stores uploaded PDF files locally:

```bash
mkdir uploads
```

This directory is gitignored.

---

## Running the Application

### Development Mode

Open **two terminals** and run:

**Terminal 1 — Backend (port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

The frontend proxies `/api` requests to the backend automatically (configured in `client/vite.config.ts`).

Open your browser at **http://localhost:5173**.

### Production Build

```bash
# Build backend
cd server
npm run build        # outputs to server/dist/

# Build frontend
cd ../client
npm run build        # outputs to client/dist/

# Start production server
cd ../server
npm start
```

### Health Check

Verify the backend is running:

```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","timestamp":"2024-..."}
```

---

## Using the Application

### 1. Register / Login

- Navigate to http://localhost:5173
- Click "Get Started" or "Sign Up"
- Register with an email and password (min 8 characters)
- You are automatically logged in after registration

### 2. Dashboard

After login you land on the Dashboard, which shows:
- **Upload Existing Resume** card — takes you to Path A
- **Build from Scratch** card — takes you to Path B
- **Your Resumes** section — lists previous resumes with match % and ATS score, with a delete button on each

### 3. Path A: Upload Resume

1. Drag & drop or click to upload a PDF resume
2. Enter your target role (e.g., "Junior Frontend Developer")
3. Enter target country (required) and city (optional)
4. Click "Upload & Analyze"
5. AI parses the PDF, analyzes against the target role, and returns results

### 4. Path B: Build from Scratch

Complete the 7-step form:
1. **Basic Info** — name, email, phone, city, country
2. **Target Role** — desired position, target country/city
3. **Education** — degree, major, university, graduation date, coursework
4. **Experience** — internships, part-time, volunteer work (optional)
5. **Projects** — name, description, technologies, your role (optional)
6. **Skills** — technical skills, soft skills, languages
7. **Additional** — certifications, extracurriculars, professional summary

Click "Submit & Generate" on the last step. AI generates a complete resume.

### 5. Analysis Page

After upload or build, you see the analysis page with:
- **Match Score** — percentage with strengths and weaknesses
- **ATS Score** — click "Calculate ATS Score" for a detailed breakdown (format compliance, keyword match, section completeness)
- **Improvement Suggestions** — click "Get Detailed Suggestions" for action verbs, quantified achievements, missing sections, keyword optimization
- **Export** — Download as PDF or Markdown

### 6. Delete Resume

On the Dashboard, click the "Delete" button on any resume card. A confirmation dialog appears before deletion.

---

## Testing

### Backend Tests

The backend uses **Jest** with **ts-jest**. Tests require the `--experimental-vm-modules` flag because pdf-parse v2 uses ES modules internally.

```bash
cd server
npm test
```

This runs:
```
node --experimental-vm-modules ./node_modules/jest/bin/jest.js
```

**Test suites (14 files, 106+ tests):**

| Suite | What it tests |
|-------|--------------|
| `authController.test.ts` | Register (409 dup, 400 invalid, 400 short pwd, DB calls), login (400 invalid, 400 missing pwd, 401 wrong creds, 200 success), logout, getMe |
| `resumeController.test.ts` | PDF upload with validation, file cleanup on error |
| `buildResumeController.test.ts` | Build from scratch flow, AI generation |
| `listResumesController.test.ts` | List user's resumes |
| `analysisController.test.ts` | Match analysis, ATS scoring, improvements |
| `exportController.test.ts` | PDF export, Markdown export |
| `errorHandler.test.ts` | AppError, Multer errors, generic errors, production/development modes |
| `upload.test.ts` | File upload middleware, PDF-only filter, size limits |
| `pdfParser.test.ts` | PDF text extraction |
| `resumeAnalyzer.test.ts` | AI resume analysis |
| `resumeGenerator.test.ts` | AI resume generation |
| `atsScorer.test.ts` | ATS scoring logic |
| `improvementAnalyzer.test.ts` | Improvement suggestion generation |
| `markdownGenerator.test.ts` | Markdown export generation |
| `pdfGenerator.test.ts` | PDF export generation |

**Run a single test file:**
```bash
cd server
node --experimental-vm-modules ./node_modules/jest/bin/jest.js --testPathPattern="authController"
```

### Frontend Tests

The frontend uses **Vitest** with **jsdom** and **@testing-library/react**.

```bash
cd client
npm test
```

For complex test files on Windows, use the threads pool to avoid timeouts:

```bash
cd client
npx vitest run --no-coverage --pool=threads
```

**Test suites (13 files, 86+ tests):**

| Suite | What it tests |
|-------|--------------|
| `DashboardPage.test.tsx` | Resume list, action cards, delete button, delete confirmation, cancel delete, error states |
| `ResumeUploadPage.test.tsx` | File upload dropzone, form validation, API call, success/error states |
| `ResumeBuilderPage.test.tsx` | Step navigation (next/back), step indicator, submit, success/error |
| `ResumeAnalysisPage.test.tsx` | Match score display, ATS score calculation, improvement suggestions, export buttons |
| `NotFoundPage.test.tsx` | 404 message, home link |
| `FileUpload.test.tsx` | Drag & drop, file input, file removal |
| `TargetRoleForm.test.tsx` | Form fields, validation, submission |
| `UploadProgress.test.tsx` | Upload/analyzing/success/error states |
| `FormSteps.test.tsx` | All 7 form steps (input fields, onChange callbacks) |
| `StepIndicator.test.tsx` | Step indicator highlighting |
| `AnalysisCards.test.tsx` | Match score card, ATS score card |
| `ImprovementSuggestions.test.tsx` | Suggestions list, detailed suggestions |
| `ExportButtons.test.tsx` | PDF/Markdown download buttons |

**Run a single test file:**
```bash
cd client
npx vitest run --no-coverage src/pages/__tests__/DashboardPage.test.tsx
```

**Run tests in watch mode:**
```bash
cd client
npx vitest --pool=threads
```

### Test Conventions

- All tests mock external dependencies (database, OpenAI API) — no real API calls
- Backend tests use `supertest` for HTTP testing with Express
- Frontend tests use `@testing-library/react` with `userEvent` for interaction
- Pages that use `useToastContext()` must be wrapped in `<ToastContext.Provider>` in tests

---

## Project Architecture

```
AI resume/
├── .env.example            # Environment variable template
├── .env                    # Your local environment (gitignored)
├── CLAUDE.md               # Project instructions for AI assistants
├── PRD.md                  # Full product requirements document
├── GUIDE.md                # This file
│
├── server/                 # Express API (TypeScript)
│   ├── src/
│   │   ├── index.ts        # Server entry point (loads .env, starts listening)
│   │   ├── app.ts          # Express app (middleware, routes, error handler)
│   │   ├── config/
│   │   │   ├── db.ts       # PostgreSQL connection pool
│   │   │   ├── passport.ts # Passport.js local strategy config
│   │   │   └── openai.ts   # OpenAI client instance
│   │   ├── controllers/
│   │   │   ├── authController.ts      # Register, login, logout, getMe
│   │   │   ├── resumeController.ts    # Upload, build, get, list, delete
│   │   │   ├── analysisController.ts  # Match %, ATS score, improvements
│   │   │   └── exportController.ts    # PDF and Markdown export
│   │   ├── middleware/
│   │   │   ├── auth.ts          # isAuthenticated guard
│   │   │   ├── upload.ts        # Multer config (PDF-only, 10MB limit)
│   │   │   ├── validate.ts      # express-validator result checker
│   │   │   ├── errorHandler.ts  # AppError class + global error handler
│   │   │   └── validators/      # Route-specific validation rules
│   │   ├── migrations/          # Numbered SQL migrations + runner
│   │   ├── routes/
│   │   │   ├── auth/            # /api/auth/*
│   │   │   ├── resume/          # /api/resume/*
│   │   │   ├── analysis/        # /api/analysis/*
│   │   │   └── export/          # /api/export/*
│   │   └── services/
│   │       ├── ai/
│   │       │   ├── resumeAnalyzer.ts       # AI resume analysis
│   │       │   ├── resumeGenerator.ts      # AI resume generation
│   │       │   ├── atsScorer.ts            # ATS scoring
│   │       │   └── improvementAnalyzer.ts  # Detailed improvements
│   │       ├── parser/
│   │       │   └── pdfParser.ts            # PDF text extraction
│   │       └── export/
│   │           ├── pdfGenerator.ts         # Puppeteer PDF generation
│   │           └── markdownGenerator.ts    # Markdown generation
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── client/                 # React SPA (TypeScript + Vite)
│   ├── src/
│   │   ├── App.tsx              # Root component (routes, toast, spinner)
│   │   ├── main.tsx             # Entry point
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── Header.tsx         # Navigation header
│   │   │   │   ├── ProtectedRoute.tsx # Auth guard wrapper
│   │   │   │   └── Toast.tsx          # Toast notification component
│   │   │   ├── resume-upload/
│   │   │   │   ├── FileUpload.tsx     # Drag & drop PDF uploader
│   │   │   │   ├── TargetRoleForm.tsx # Target role/country/city form
│   │   │   │   └── UploadProgress.tsx # Upload status indicator
│   │   │   ├── resume-builder/
│   │   │   │   ├── StepIndicator.tsx  # Multi-step progress bar
│   │   │   │   └── steps/             # 7 form step components
│   │   │   ├── analysis/
│   │   │   │   ├── MatchScoreCard.tsx
│   │   │   │   ├── AtsScoreCard.tsx
│   │   │   │   └── ImprovementSuggestions.tsx
│   │   │   └── export/
│   │   │       └── ExportButtons.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ResumeUploadPage.tsx
│   │   │   ├── ResumeBuilderPage.tsx
│   │   │   ├── ResumeAnalysisPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts        # Auth state management
│   │   │   └── useToast.ts       # Toast notification state
│   │   ├── contexts/
│   │   │   └── ToastContext.tsx   # Toast context for app-wide access
│   │   ├── utils/
│   │   │   └── api.ts            # Axios instance + API helper functions
│   │   └── types/
│   │       └── index.ts          # TypeScript interfaces
│   ├── vite.config.ts       # Vite config (proxy /api to backend)
│   ├── vitest.config.ts     # Vitest config
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── uploads/                 # Uploaded PDF storage (gitignored)
```

---

## API Reference

All routes are prefixed with `/api`. Protected routes require an active session (login first).

### Authentication

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/api/auth/register` | No | `{ email, password }` | `201 { user: { id, email } }` |
| `POST` | `/api/auth/login` | No | `{ email, password }` | `200 { user: { id, email } }` |
| `POST` | `/api/auth/logout` | No | — | `200 { message }` |
| `GET`  | `/api/auth/me` | Yes | — | `200 { user }` or `401` |

### Resume Management

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/api/resume/upload` | Yes | `multipart/form-data` (file + targetRole + targetCountry + targetCity?) | `201 { resume }` |
| `POST` | `/api/resume/build` | Yes | `{ fullName, email, ... }` (full form data) | `201 { resume }` |
| `GET`  | `/api/resume/:id` | Yes | — | `200 { resume }` |
| `GET`  | `/api/resume` | Yes | — | `200 { resumes: [...] }` |
| `DELETE` | `/api/resume/:id` | Yes | — | `200 { message }` |

### AI Analysis

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/api/analysis/match` | Yes | `{ resumeId }` | `200 { matchPercentage, strengths, weaknesses, suggestions }` |
| `POST` | `/api/analysis/ats-score` | Yes | `{ resumeId }` | `200 { atsBreakdown }` |
| `POST` | `/api/analysis/improve` | Yes | `{ resumeId }` | `200 { detailed }` |

### Export

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/api/export/pdf` | Yes | `{ resumeId }` | `200` (binary PDF) |
| `POST` | `/api/export/markdown` | Yes | `{ resumeId }` | `200` (text/markdown) |

### Rate Limits

- `/api/auth/login` and `/api/auth/register`: 20 requests per 15 minutes
- All `/api/*` routes: 100 requests per 15 minutes

---

## Troubleshooting

### "ECONNREFUSED" when starting the frontend
The backend is not running. Start the backend first with `cd server && npm run dev`.

### "relation does not exist" database errors
Run migrations: `cd server && npm run migrate`.

### "OPENAI_API_KEY is not set" or AI requests fail
Ensure your `.env` file has a valid `OPENAI_API_KEY`. Restart the server after changing `.env`.

### Puppeteer fails to launch / PDF export errors
Puppeteer downloads Chromium automatically on `npm install`. If it fails:
```bash
cd server
npx puppeteer browsers install chrome
```
On Linux servers, you may need additional system dependencies: `apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxrandr2 libgbm1 libpango-1.0-0 libasound2`.

### Frontend tests timeout on Windows
Use the threads pool:
```bash
npx vitest run --no-coverage --pool=threads
```

### Backend `upload.test.ts` fails with EBUSY on Windows
This is a known Windows file-locking issue when test cleanup tries to delete temporary files while they are still held. It does not affect other tests or production code.

### "Session expired" or auth not persisting
- Ensure `SESSION_SECRET` is set in `.env`
- Ensure PostgreSQL session table exists (run migrations)
- In development, cookies use `sameSite: 'lax'` and `secure: false`; in production, set `NODE_ENV=production` for secure cookies

---

## Future Improvements

### High Priority

**Real-Time Job Market Integration**
Integrate the Adzuna Job API (or similar) to provide real match percentages based on live job postings rather than AI estimates. Show active openings count, salary ranges, and most-requested skills for the target role and location.

**In-App Resume Editor**
Allow users to edit the AI-generated resume directly in the browser before exporting. This would support section reordering, inline text editing, and live preview with re-export capability.

**Multiple Resume Versions**
Let users save multiple resumes targeting different roles. Add a comparison view to see how different versions score. Currently the app stores multiple resumes per user but has no version management or comparison UI.

**Cover Letter Generator**
Use the same AI pipeline to generate tailored cover letters. The resume data and target role are already available; this would be a natural extension of the analysis page.

### Medium Priority

**OAuth / Social Login**
Add Google and GitHub OAuth login options alongside email/password. This reduces signup friction significantly for the target audience (new graduates and developers).

**Password Reset Flow**
Implement forgot-password via email with a secure token. Currently there is no way to recover a lost password.

**Save Draft Functionality**
The multi-step builder form loses data on page refresh. Add auto-save to `localStorage` or the database so users can return and continue later.

**Resume Templates**
Offer 3-5 different ATS-compliant PDF templates with varying styles (modern, classic, minimalist). Let the user preview and choose before export.

**Internationalization (i18n)**
Support multiple languages for the UI and AI-generated content. The target role and location fields already support international input, but the interface is English-only.

### Lower Priority

**AI Resume Rating Dashboard**
Visual breakdown of the resume score with charts (radar chart for skill categories, bar chart for section scores). Compare the user's resume against an "ideal" junior candidate profile.

**Job Application Tracker**
Let users track where they submitted each resume, set follow-up reminders, and log interview outcomes. This turns the tool from a one-time generator into an ongoing job search companion.

**Cloud File Storage**
Replace local filesystem uploads with S3 or similar cloud storage. This is required for any multi-instance deployment.

**Docker & CI/CD**
Add a `Dockerfile` and `docker-compose.yml` for one-command local setup (app + PostgreSQL). Set up GitHub Actions for automated testing on push.

**Email Notifications**
Send a welcome email on registration and notify users when their AI analysis is complete (useful if analysis is made asynchronous in the future).

**Accessibility Audit**
Run a full WCAG 2.1 AA audit. The current UI uses semantic HTML and ARIA labels in some places but has not been comprehensively audited.

**Performance Optimization**
- Add Redis caching for AI analysis results (same resume + role should not re-call OpenAI)
- Lazy-load heavy pages (ResumeBuilderPage with 7 step components)
- Add database indexes on `resumes.user_id` and `resume_data.resume_id`

### Technical Debt

- Migrate from `express-session` with PostgreSQL store to JWT tokens for better horizontal scaling
- Add input sanitization on all text fields to prevent XSS (currently relying on React's built-in escaping)
- Add request logging middleware (e.g., `morgan` or `pino`)
- Add OpenAPI/Swagger documentation for the API
- Increase test coverage: add integration tests that hit a real test database
- Upgrade React Router from v6 to v7 (currently showing deprecation warnings)
