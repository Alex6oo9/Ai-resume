Here is a complete, copy-paste-ready guide structured so you can work through it step by step alongside Claude Code. Each section is labeled with **who does what**.

***

## Phase 1 — Prepare Your Repo

**You do this before touching any platform.**

Your project must have this folder structure pushed to GitHub before deploying:

```
proresumeai/
├── client/          ← React frontend
│   ├── package.json
│   └── vite.config.ts
├── server/          ← Node.js backend
│   ├── package.json
│   └── src/app.ts
└── (root files)
```

If it's not on GitHub yet, ask Claude Code:
> *"Help me initialize a Git repo, create a `.gitignore` that excludes `node_modules`, `.env`, and `client/dist`, then push everything to a new GitHub repo."*

***

## Phase 2 — Set Up Neon Database

### Step 1 — Create Your Neon Project (You)

1. Go to [neon.tech](https://neon.tech) → **Sign Up** (free, use Google or GitHub)
2. Click **"New Project"**
3. Name it `proresumeai-prod`
4. Region: choose **Singapore (AWS ap-southeast-1)** — closest to Bangkok
5. Click **"Create Project"**

### Step 2 — Get Your Connection String (You)

1. In your new Neon project dashboard, click the **"Connect"** button (top right)
2. Make sure **"Pooled connection"** is selected (better for Express apps)
3. Copy the full connection string — it looks like: [neon](https://neon.com/docs/connect/connect-from-any-app)

```
postgresql://neondb_owner:AbC123dEf@ep-cool-darkness-a1b2c3d4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

4. **Save this somewhere safe** — you'll need it in multiple places

### Step 3 — Run Migrations Against Neon (Claude Code)

Ask Claude Code:
> *"Update my database connection to work with Neon. The `pg` pool needs `ssl: { rejectUnauthorized: false }` when `NODE_ENV=production`. Then run all migrations against this Neon DATABASE_URL."*

Claude Code will modify your `server/src/config/db.ts` to look like this:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});
```

Then run migrations **locally** pointed at Neon to set up all your tables:

```bash
DATABASE_URL="your-neon-connection-string" npm run migrate
```

Run this from your `server/` folder. You should see all your migrations execute (003 through 030+). [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/6d0bd4b0-8798-48e0-b81f-0a1baf714573/Resume_Builder_Feature-2.md)

### Step 4 — Verify Tables Were Created (You)

In Neon dashboard → **Tables** tab on the left — you should see:
`users`, `resumes`, `resume_data`, `cover_letters`, `sessions` etc.

***

## Phase 3 — Fix Puppeteer for Render

This is the trickiest part. Render's filesystem doesn't reliably keep Puppeteer's downloaded Chrome at runtime. The most stable fix is switching to `@sparticuz/chromium`. [community.latenode](https://community.latenode.com/t/render-com-puppeteer-setup-issue-chrome-executable-not-found-error/32509)

### Step 5 — Install Sparticuz Chromium (Claude Code)

Ask Claude Code:
> *"Replace `puppeteer` with `puppeteer-core` and `@sparticuz/chromium-min` in the server. Update the PDF generator service to use the sparticuz chromium executable path when `NODE_ENV=production`, and keep the default puppeteer path for local development."*

Claude Code will:

1. Run in `server/`:
```bash
npm uninstall puppeteer
npm install puppeteer-core @sparticuz/chromium-min
```

2. Update `server/src/services/exportPdfGenerator.ts`:
```typescript
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

export async function generatePdf(html: string, opts?: { margins?: boolean }): Promise<Buffer> {
  const executablePath = process.env.NODE_ENV === 'production'
    ? await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      )
    : '/usr/bin/google-chrome-stable'; // or your local chrome path

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    margin: opts?.margins === false ? { top: 0, right: 0, bottom: 0, left: 0 } : undefined,
  });
  await browser.close();
  return Buffer.from(pdf);
}
```

### Step 6 — Create a render-build.sh Script (Claude Code)

Ask Claude Code:
> *"Create a `render-build.sh` script in the server root that installs dependencies and builds the TypeScript project."*

```bash
#!/usr/bin/env bash
# server/render-build.sh
set -e
npm install
npm run build
```

Make it executable:
```bash
chmod +x server/render-build.sh
```

Push all these changes to GitHub before moving to Phase 4.

***

## Phase 4 — Deploy Backend to Render

### Step 7 — Create a Render Web Service (You)

1. Go to [render.com](https://render.com) → **Sign Up** (use GitHub)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → select your `proresumeai` repo
4. Fill in the form:

| Field | Value |
|---|---|
| **Name** | `proresumeai-backend` |
| **Region** | Singapore |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `./render-build.sh` |
| **Start Command** | `node dist/app.js` |
| **Instance Type** | **Starter ($7/mo)** ← do NOT use free tier (it sleeps) |

5. Click **"Create Web Service"** — it will start building (will likely fail the first time — that's fine)

### Step 8 — Add All Environment Variables (You)

In Render → your service → **"Environment"** tab → click **"Add Environment Variables"**. Add every single one: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/6d0bd4b0-8798-48e0-b81f-0a1baf714573/Resume_Builder_Feature-2.md)

```
NODE_ENV                  = production
PORT                      = 10000
DATABASE_URL              = <paste your Neon connection string>
SESSION_SECRET            = <run: openssl rand -hex 32>
OPENAI_API_KEY            = sk-...
CLIENT_URL                = https://proresumeai.app
CLOUDINARY_CLOUD_NAME     = your-cloud-name
CLOUDINARY_API_KEY        = your-api-key
CLOUDINARY_API_SECRET     = your-api-secret
RESEND_API_KEY            = re_...
FROM_EMAIL                = noreply@proresumeai.app
```

Generate `SESSION_SECRET` by running this in your terminal:
```bash
openssl rand -hex 32
```

After adding vars, click **"Save Changes"** → Render will auto-redeploy.

### Step 9 — Verify Backend is Live (You)

Once the deploy turns green, click your Render URL (e.g. `https://proresumeai-backend.onrender.com`) and visit:

```
https://proresumeai-backend.onrender.com/api/health
```

You should get:
```json
{ "status": "healthy" }
```

If you see errors, click **"Logs"** in Render and paste them to Claude Code:
> *"Here are my Render deploy logs — fix the issue: [paste logs]"*

***

## Phase 5 — Connect Your Domain to the Backend

### Step 10 — Add Custom Domain on Render (You)

1. In Render → your service → **"Settings"** → **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Enter: `api.proresumeai.app`
4. Render will show you a **CNAME record** to add

### Step 11 — Add DNS Record at Your Registrar (You)

Log in to wherever you bought `proresumeai.app` and add:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `api` | `your-service.onrender.com` |

DNS takes 5–30 minutes to propagate. After that, `https://api.proresumeai.app/api/health` should work with a green SSL lock.

### Step 12 — Update CLIENT_URL in Render (You)

Go back to Render → **Environment** → update:
```
CLIENT_URL = https://proresumeai.app
```

Trigger a manual redeploy (Render → **Manual Deploy** → **Deploy latest commit**).

***

## Phase 6 — Final Verification Checklist

Ask Claude Code to run through this with you:
> *"Help me test every critical endpoint before I launch."*

```bash
# 1. Health check
curl https://api.proresumeai.app/api/health

# 2. Check CORS headers (replace with your actual frontend URL)
curl -I -H "Origin: https://proresumeai.app" https://api.proresumeai.app/api/health

# 3. Test a protected route returns 401 (not 500)
curl https://api.proresumeai.app/api/resume
```

Expected results: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/6d0bd4b0-8798-48e0-b81f-0a1baf714573/Resume_Builder_Feature-2.md)
- Health: `{ "status": "healthy" }`
- Protected route: `{ "error": "Unauthorized" }` (401) — NOT a 500 crash

***

## Quick Reference — Common Errors & Fixes

| Error | Fix |
|---|---|
| `CORS error` in browser | `CLIENT_URL` in Render doesn't exactly match frontend domain |
| `Sessions not persisting` | `SESSION_SECRET` changed or `secure: true` without HTTPS |
| PDF export returns 500 | Check Render logs — Chromium path issue, re-run Phase 3 |
| `npm run migrate fails` | `DATABASE_URL` wrong or missing `?sslmode=require` in Neon URL |
| `413 Request Too Large` | Set `express.json({ limit: '10mb' })` in `app.ts`  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/6d0bd4b0-8798-48e0-b81f-0a1baf714573/Resume_Builder_Feature-2.md) |
| `404 on page refresh` | `NODE_ENV=production` not set — Express won't serve `client/dist` |