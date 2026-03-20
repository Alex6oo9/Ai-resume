# Server-Down UX: Architecture & Guide

## Problem Statement

When the Express server is not running (or unreachable), all Axios API calls fail with network errors (`ECONNREFUSED`, `ETIMEDOUT`). Previously, users saw a blank page or a broken login form with no explanation. This feature adds detection, clear UI feedback, and automatic recovery.

---

## Architecture

The solution is **event-driven**: the Axios interceptor fires DOM events, and a React context listens to them. No polling begins until the server is actually detected as down.

```
Axios response interceptor
  ↓ (no response / timeout)
window.dispatchEvent('server:down')
  ↓
ConnectivityContext listener
  → sets isServerDown = true
  → starts polling /api/health every 10 s
  ↓
ServerDownBanner renders (sticky, top of page)
  ↓ (health check succeeds)
window.dispatchEvent('server:recovered')
  → banner disappears
  → showToast('Server is back online')
```

---

## Error Classification

| Condition | `error.response` | Event dispatched | Treated as |
|-----------|-----------------|------------------|------------|
| `ECONNREFUSED` | `undefined` | `server:down` | Server unreachable |
| `ETIMEDOUT` | `undefined` | `server:down` | Server unreachable |
| HTTP 500–599 | present | `server:error` | Server degraded |
| HTTP 401 | present | *(none)* | Auth expired — redirect to login |
| HTTP 403 | present | *(none)* | Forbidden — pass through |
| Successful response | present | `server:up` | Server healthy — clears down state |

---

## Health Check Endpoint

`GET /api/health` — no authentication required.

**Healthy response** (both API and DB reachable):
```json
{
  "status": "healthy",
  "timestamp": "2026-03-17T10:00:00.000Z",
  "checks": {
    "api": "ok",
    "db": { "status": "ok", "latencyMs": 3 }
  }
}
```

**Degraded response** (API up, DB unreachable):
```json
{
  "status": "degraded",
  "timestamp": "2026-03-17T10:00:00.000Z",
  "checks": {
    "api": "ok",
    "db": { "status": "degraded" }
  }
}
```

The client health poller considers `status === 'healthy'` (or `'ok'` for backward compat) as a successful recovery.

---

## Retry / Backoff Strategy

| Error type | Auto-retry? | Interval |
|-----------|-------------|---------|
| Network error / server down | Yes — polls `/api/health` | Every 10 s (fixed, no backoff) |
| 5xx server error | No — user retries manually via toast/button | — |
| 401/403 | No — auth flow handles it | — |
| Timeout on health check | Treated as unhealthy | Same 10 s poll |

Fixed 10 s (no exponential backoff) was chosen intentionally: fast recovery UX matters more than reducing health-check load when the server is already down.

---

## UX Behavior Table

| Scenario | Detection | User Sees |
|----------|-----------|-----------|
| Server not running | `!error.response` | Red sticky banner: "Unable to reach the server. Retrying… (attempt N)" |
| Server error (5xx) | `status >= 500` | Yellow sticky banner: "Server is experiencing issues" |
| Server comes back | Health check returns `healthy` | Banner disappears, green toast: "Server is back online" |
| Login while server down | Banner already visible | Red banner at top; login form still rendered but API calls fail gracefully |
| Auth expired (401) | `status === 401` | Redirect to `/login` (unchanged behavior) |
| Timeout (`ETIMEDOUT`) | `!error.response` | Same red banner as ECONNREFUSED |

---

## Files Changed / Created

| File | Change |
|------|--------|
| `server/src/app.ts` | `/api/health` now queries `SELECT 1` and returns DB latency / degraded status |
| `client/src/utils/api.ts` | Added `timeout: 10000`; response interceptor fires `server:down` / `server:up` / `server:error` |
| `client/src/contexts/ConnectivityContext.tsx` | **New** — global connectivity state + health polling |
| `client/src/components/shared/ServerDownBanner.tsx` | **New** — sticky banner with retry button |
| `client/src/App.tsx` | Wrapped with `<ConnectivityProvider>`, added `<ServerDownBanner>` in `AppLayout` |
| `client/src/hooks/useAuth.ts` | `checkAuth` distinguishes network errors from 401 (no redirect on network error) |

---

## How to Test

1. **Server not running** — start only the client (`cd client && npm run dev`). Navigate to `/login`. You should see the red banner within a few seconds of any API call firing.

2. **Auto-recovery** — while banner is showing, start the server (`cd server && npm run dev`). Within 10 s, the banner disappears and a green toast "Server is back online" appears.

3. **Mid-session kill** — log in, navigate to Dashboard, then kill the server process. Trigger any action (e.g., refresh page data). Banner should reappear.

4. **Manual retry** — click "Retry now" in the banner. It immediately fires a health check instead of waiting 10 s.

5. **Health endpoint** — `curl http://localhost:5000/api/health` should return `{ "status": "healthy", ... }` when both API and DB are up.

6. **DevTools throttle** — in Chrome DevTools → Network → Throttling, set to "Offline". The next API call will trigger the banner.
