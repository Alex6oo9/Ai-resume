# AI Resume Builder

## Overview

AI-powered web app that helps fresh graduates build ATS-optimized resumes or improve existing ones. Two paths: upload a PDF for AI analysis, or build from scratch via a multi-step form. Provides match percentage, strengths/weaknesses, and improvement suggestions using GPT-4o-mini.

See [PRD.md](./PRD.md) for full product requirements and specifications.
Whenever significant changes are made to the project, update the CLAUDE.md , [client/CLIENT.md](./client/CLIENT.md) and [SERVER.md](./server/SERVER.md) file to reflect the changes.

## Reference Documentation

When working on frontend/backend integration, API contracts, or data structures:

- **[client/CLIENT.md](./client/CLIENT.md)** — Everything the server needs to know about the client
  - API client configuration (axios baseURL, withCredentials)
  - All API endpoints used by client with request/response examples
  - Data structures sent to server (ResumeFormData interface)
  - Authentication flow and session handling
  - File upload patterns
  - Error handling expectations

- **[server/SERVER.md](./server/SERVER.md)** — Everything the client needs to know about the server
  - Complete API endpoint documentation with examples
  - Request/response formats for all routes
  - Authentication requirements and middleware
  - Data transformation patterns (especially skills structure)
  - Error response formats
  - Database schema and storage details

**Use these references when:**
- Implementing new API endpoints or client features
- Debugging 404/400/500 errors
- Understanding data structure mismatches
- Clarifying authentication flow
- Adding new form fields or data transformations

## Tech Stack

| Layer          | Technology                                      |
|----------------|------------------------------------------------|
| Frontend       | React 18, TypeScript, TailwindCSS, Vite, React Router v6 |
| Backend        | Node.js, Express 4, TypeScript                  |
| Database       | PostgreSQL (sessions + data)                     |
| Auth           | Passport.js (local strategy, session-based)      |
| AI             | OpenAI API (GPT-4o-mini)                         |
| PDF Parsing    | pdf-parse v2 (pdfjs-dist)                        |
| PDF Generation | Puppeteer (Phase 5)                              |
| File Upload    | Multer (local filesystem)                        |
| Testing        | Jest + ts-jest (backend), Vitest + Testing Library (frontend) |

## Project Structure

```
├── server/                 # Express API
│   └── src/
│       ├── config/         # db.ts, passport.ts, openai.ts
│       ├── controllers/    # resumeController, exportController, templateController
│       ├── middleware/      # auth, upload, validate, errorHandler, validators/
│       ├── migrations/     # Numbered SQL migrations (001–008) + runner
│       ├── routes/         # auth/, resume/, analysis/, export/, templates/
│       ├── services/       # ai/ (resumeAnalyzer, resumeGenerator), export/ (pdfGenerator), parser/, templateQueries
│       ├── utils/          # sanitizePromptInput (AI prompt injection defense)
│       └── types/          # template.types.ts
├── client/                 # React SPA
│   └── src/
│       ├── components/
│       │   ├── shared/          # Header, toast, etc.
│       │   ├── resume-upload/   # Path A: PDF upload flow
│       │   ├── resume-builder/  # Path B: multi-step form + StepIndicator
│       │   ├── live-preview/    # ResumePreview, TemplateRenderer (shim), TemplateSelector, TemplatePreviewModal, templateTypes.ts
│       │   └── templates/       # TemplateSwitcher, TemplateCard, ResumeTemplateSwitcher, 7 template components, types.ts, helpers/
│       ├── pages/          # HomePage, Login, Register, Dashboard, ResumeUploadPage, ResumeBuilderPage
│       ├── hooks/          # useAuth, useTemplates, useTemplateSwitch
│       ├── utils/          # api.ts (axios instance + helpers)
│       └── types/          # TypeScript interfaces (index.ts)
├── uploads/                # Uploaded PDF storage (gitignored)
├── PRD.md                  # Product requirements
└── .env                    # Environment variables (see .env.example)
```

## Development Standards

### Code Conventions
- **TypeScript strict mode** in both server and client
- **Express pattern**: controllers use `(req, res, next) => { try { ... } catch(err) { next(err) } }`
- **Auth access**: user ID via `(req.user as any).id` after `isAuthenticated` middleware
- **Frontend state**: React hooks (useState, custom hooks), no external state library
- **Styling**: TailwindCSS utility classes, no CSS files
- **Imports**: named exports for services/middleware, default exports for React components

### Testing
- **TDD approach**: write failing tests first, then implement
- **Backend tests**: Jest with ts-jest, mocks for DB/OpenAI/services, supertest for HTTP
- **Frontend tests**: Vitest + jsdom + @testing-library/react
- **No real API calls in tests**: always mock OpenAI and database

### API Design
- All routes under `/api/` prefix
- Auth routes: `/api/auth/*`
- Resume routes: `/api/resume/*` (all require authentication)
- Analysis routes: `/api/analysis/*` (all require authentication)
- Export routes: `/api/export/*` (all require authentication)
- Multipart uploads use `Content-Type: multipart/form-data`
- All other requests use `Content-Type: application/json`

### Database
- PostgreSQL with raw SQL queries via `pg` pool (no ORM)
- UUIDs for primary keys (`gen_random_uuid()`)
- Migrations in `server/src/migrations/` numbered sequentially (001–019)
- Tables: `users`, `session`, `resumes`, `resume_data`, `migrations`, `templates`, `subscriptions`, `resume_history`, `analysis_history`
- **Dropped**: `template_configurations` (styling now lives in React template components)

## Common Commands

### Setup
```bash
# Install dependencies
cd server && npm install
cd client && npm install

# Configure environment
cp .env.example .env  # then edit with real values

# Run database migrations
cd server && npm run migrate
```

### Development
```bash
# Start backend (port 5000)
cd server && npm run dev

# Start frontend (port 5173, proxies /api to backend)
cd client && npm run dev
```

### Testing
```bash
# Backend tests (requires --experimental-vm-modules for pdf-parse v2)
cd server && npm test

# Frontend tests
cd client && npm test
```

### Build
```bash
cd server && npm run build    # outputs to server/dist/
cd client && npm run build    # outputs to client/dist/
```

## Environment Variables

See `.env.example` — required:
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — express-session secret
- `OPENAI_API_KEY` — OpenAI API key
- `PORT` — server port (default 5000)
- `CLIENT_URL` — frontend origin for CORS (default http://localhost:5173)

## Current Progress

- [x] **Phase 1**: Core infrastructure — auth, DB, routing, UI shell
- [x] **Phase 2**: Resume upload flow — PDF upload, parsing, AI analysis, frontend components
- [x] **Phase 3**: Resume builder form (Path B) — multi-step form with validation
- [x] **Phase 4**: AI analysis engine — match %, ATS scoring, improvement suggestions
- [x] **Phase 5**: Export functionality — Puppeteer PDF generation, Markdown export
- [x] **Phase 6**: Polish & testing — security middleware, error handling, cascade delete fix, 404 page, toast notifications, delete resume feature, test coverage
- [x] **Upload & Analysis Hardening** — prompt injection sanitization, AI rate limiting (10 req/15min), improvement caching, client file size validation, progress state transitions, upload cancellation (AbortController), navigation cleanup
- [x] **Template system** — 7 per-component templates (`modern_minimal`, `creative_bold`, `professional_classic`, `tech_focused`, `healthcare_pro`, `warm_creative`, `sleek_director`), live preview, template switcher, photo support, DB migrations 001–012, subscription-tier gating scaffold, per-template React refactor (each template is a self-contained `.tsx` component)
- [x] **Phase 7**: Deployment — template-aware PDF export ✓, production build ✓, SPA static serving ✓
- [x] **Phase 5 (Analysis UX)**: Original PDF viewer (Path A, `GET /resume/:id/file`), ATS score SVG donut chart (pure SVG, no packages), analysis history per resume (`analysis_history` table, migration 019, `GET /analysis/history/:resumeId`)
