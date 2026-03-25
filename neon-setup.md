# Connecting a Node.js/Express App to Neon PostgreSQL

A reusable guide for setting up Neon as your cloud PostgreSQL database in future projects.

---

## Prerequisites

- Node.js backend using `pg` (node-postgres) library
- A [Neon account](https://neon.tech) (free tier available)
- Your migration runner uses `DATABASE_URL` environment variable
- Optional: [Neon MCP server](https://github.com/neondatabase/mcp-server-neon) installed in Claude Code for CLI-based setup

---

## Step 1 — Create a Neon Project

### Option A: Via Neon Console (manual)
1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **New Project**
3. Choose a name, region closest to your users, and PostgreSQL version (use latest)
4. Click **Create Project**

### Option B: Via Neon MCP (if installed in Claude Code)
Claude can create the project for you with:
```
mcp__Neon__create_project({ name: "your-project-name" })
```

---

## Step 2 — Get Your Connection String

From the Neon console:
1. Open your project → **Connection Details**
2. Select the **Pooler** endpoint (not direct) — better for production, handles connection limits
3. Copy the connection string — it looks like:
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   ```

Via MCP:
```
mcp__Neon__get_connection_string({ projectId: "your-project-id" })
```

> **Keep this secret.** Treat it like a password — never commit it to git.

---

## Step 3 — Update Your Database Config (`db.ts` / `db.js`)

The `pg` library requires explicit SSL configuration to connect to Neon.
Use this pattern so local development (no SSL) and production (SSL required) both work:

```typescript
import { Pool } from 'pg';

const isNeon = process.env.DATABASE_URL?.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
```

**Why `rejectUnauthorized: false`?**
Neon uses a CA-signed certificate, but some Node.js environments (especially Windows) block
certificate chain validation. This is standard practice and safe for Neon's infrastructure.

**Why `isNeon` check?**
Your local `.env` still points to `localhost` — no SSL needed. The check means you never
touch your local dev setup.

---

## Step 4 — Run Migrations Against Neon

Pass the Neon `DATABASE_URL` inline so your migration script targets Neon instead of localhost:

```bash
# From your server/ directory
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?channel_binding=require&sslmode=require" npm run migrate
```

This is a one-time step. Your migration runner's idempotency check (`migrations` table) ensures
re-running it never duplicates work.

> **Note:** You'll see this warning — it's harmless, just a heads-up about a future `pg` version change:
> ```
> Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated
> as aliases for 'verify-full'.
> ```
> To silence it, you can use `sslmode=verify-full` in your connection string instead.

---

## Step 5 — Set Env Vars on Your Hosting Platform

When deploying your backend (Render, Railway, Heroku, Fly.io, etc.), set:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your full Neon pooler connection string |
| `NODE_ENV` | `production` |

Your local `.env` stays pointing to `localhost` — no changes needed.

### Render (example)
1. Dashboard → your Web Service → **Environment** (left sidebar)
2. **Add Environment Variable** for each key above
3. **Save Changes** → Render auto-redeploys

---

## Key Notes for Production

| Topic | Detail |
|-------|--------|
| **Free tier** | 512 MB storage, 1 project, auto-suspends after 5 min inactivity |
| **Auto-suspend** | Cold start ~1 second — acceptable for most apps. Set `suspend_timeout_seconds: 0` to disable |
| **Pooler endpoint** | Always use the `-pooler` hostname in production. Handles connection limits with PgBouncer |
| **Direct endpoint** | Use the non-pooler URL only for migrations (DDL statements don't work well through PgBouncer) |
| **Connection limit** | Free tier: 1 compute unit = ~100 connections max. Pooler multiplexes these efficiently |
| **Regions** | Choose a region close to your hosting platform to minimize latency |
| **Backups** | Neon provides point-in-time restore (PITR) — 7 days on free, more on paid plans |

---

## Checklist

- [ ] Neon project created
- [ ] Pooler connection string obtained and saved securely
- [ ] `db.ts` updated with SSL `isNeon` check
- [ ] Migrations run against Neon (`npm run migrate` with Neon `DATABASE_URL`)
- [ ] `DATABASE_URL` set on hosting platform
- [ ] Local `.env` unchanged (still points to localhost)
- [ ] Connection string NOT committed to git (check `.gitignore` covers `.env`)
