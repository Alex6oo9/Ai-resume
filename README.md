# ProResumeAI

AI-powered platform that helps fresh graduates prepare for their job search end to end — build an ATS-optimized resume, generate a tailored cover letter, and (soon) get matched to jobs automatically.

## Features

### 📄 Resume Builder
- **Path A** — Upload an existing PDF resume for AI parsing and analysis
- **Path B** — Build a resume from scratch via a guided 6-step form with live preview
- AI-generated skill suggestions and professional summaries (GPT-4o-mini)
- 7 professional templates (modern + ATS-friendly), photo support on select templates
- Match %, ATS score breakdown, strengths/weaknesses, and improvement suggestions
- Export to PDF (template-aware, Puppeteer) or Markdown
- Draft saving/restoration, analysis history

### ✉️ Cover Letter Generator
- Paste a job description → AI extracts matched/missing keywords, then writes a tailored letter
- 4 tones (professional, enthusiastic, formal, conversational) and 3 length targets
- Rich-text editing (TipTap), live word count and keyword coverage
- Revert to AI original, regenerate, or "Refine with AI" using company/achievement context
- Multiple letters per resume, or standalone letters not tied to any resume

### 🎯 Job Match & Outreach Agent *(Planned)*
- Background job discovery matched against your resume and preferences
- Drafts a ready-to-send outreach email — nothing is sent without your approval

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TailwindCSS, Vite, React Router v6 |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL (raw SQL via `pg`, no ORM) |
| Authentication | Passport.js (session-based) + Google OAuth 2.0 |
| AI Engine | OpenAI GPT-4o-mini |
| PDF Parsing | pdf-parse v2 (pdfjs-dist) |
| PDF Generation | Puppeteer |
| Email | Resend |
| Rich Text Editor | TipTap |
| Testing | Jest + ts-jest (backend), Vitest + Testing Library (frontend), Playwright (E2E) |

## Project Structure

```
├── server/                 # Express API
│   └── src/
│       ├── config/          # db, passport, openai
│       ├── controllers/     # resume, analysis, export, templates, cover-letter
│       ├── middleware/      # auth, upload, validation, error handling
│       ├── migrations/      # Numbered SQL migrations + runner
│       ├── routes/          # /api/auth, /api/resume, /api/analysis, /api/export, /api/cover-letter, /api/templates
│       ├── services/        # ai/ (analysis, generation), export/ (PDF), email/, parser/
│       └── types/
├── client/                  # React SPA
│   └── src/
│       ├── components/      # resume-upload, resume-builder, live-preview, templates, shared/ui
│       ├── contexts/        # Auth, Theme, Connectivity
│       ├── pages/           # Home, Login, Register, Dashboard, Builder, Analysis, Cover Letter, etc.
│       ├── hooks/           # useAuth, useTemplates, useTemplateSwitch
│       └── utils/           # api.ts (axios client)
├── PRD.md                   # Full product requirements
├── client/CLIENT.md         # Client-side API contract & data structures
└── server/SERVER.md         # Server-side API & DB documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Setup

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Configure environment (server)
cd ../server
cp .env.example .env   # then fill in real values

# Run database migrations
npm run migrate
```

### Environment Variables (server/.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/airesume
SESSION_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Google OAuth (optional, for "Sign in with Google")
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email (optional; falls back to console logging in dev)
RESEND_API_KEY=
FROM_EMAIL=AI Resume Builder <noreply@resend.dev>
```

### Development

```bash
# Backend (port 5000)
cd server && npm run dev

# Frontend (port 5173, proxies /api to backend)
cd client && npm run dev
```

### Testing

```bash
# Backend (requires --experimental-vm-modules for pdf-parse v2)
cd server && npm test

# Frontend
cd client && npm test

# E2E (Playwright)
cd client && npx playwright test
```

### Build

```bash
cd server && npm run build    # → server/dist/
cd client && npm run build    # → client/dist/
```

## API Overview

All endpoints are prefixed with `/api`. Full request/response contracts live in [`server/SERVER.md`](./server/SERVER.md) and [`client/CLIENT.md`](./client/CLIENT.md).

| Group | Base Path | Notes |
|---|---|---|
| Auth | `/api/auth/*` | Register, login, email verification, password reset, Google OAuth |
| Resume | `/api/resume/*` | Upload, build, drafts, export triggers, template switching |
| Templates | `/api/templates/*` | List/fetch templates with subscription-tier lock status |
| Analysis | `/api/analysis/*` | Match %, ATS scoring, improvement suggestions, re-analyze, history |
| Cover Letters | `/api/cover-letter/*` | Keyword extraction, generation, regenerate, improve, CRUD |
| Export | `/api/export/*` | PDF (Puppeteer) and Markdown export |

All authenticated routes use session-based auth (`express-session` + Passport.js); AI-related endpoints are rate-limited to 10 requests/15 min per IP.

## Deployment

Deployed on **DigitalOcean App Platform** as two components within one App:
- **Static Site** — `client/`, build with `npm run build`, output `dist/` (requires "Catchall Document" set to `index.html` for SPA routing)
- **API Service** — `server/`, build with `npm install && npm run build`, start with `node dist/migrations/run.js && node dist/index.js`

See [`deploy.md`](./deploy.md) for the full setup guide.

## Roadmap

- [ ] Job Match & Outreach Agent — background job discovery, resume matching, and approval-gated outreach emails
- [ ] Gmail/Outlook OAuth for sending outreach emails from the user's own inbox
- [ ] Multiple resume versions per user
- [ ] Job application tracker
- [ ] Premium templates with color customization
- [ ] In-app resume text editing

## Documentation

- [`PRD.md`](./PRD.md) — Full product requirements and specifications
- [`client/CLIENT.md`](./client/CLIENT.md) — Client-side API usage and data contracts
- [`server/SERVER.md`](./server/SERVER.md) — Server-side API and database documentation

## License

No license file is currently included in this repository. All rights reserved unless otherwise stated by the project owner.
