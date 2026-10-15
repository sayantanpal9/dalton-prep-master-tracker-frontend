# Master Tracker frontend

Responsive React workspace for the Master Team Tracker API. The frontend is in
this directory and does not require changes to `backend`.

## Run locally

Use two terminals from the project root:

```powershell
# Terminal 1 — start the existing API
Set-Location .\backend
npm install
npm run dev

# Terminal 2 — start this frontend
Set-Location .\frontend
npm install
npm run dev
```

Open the Vite URL shown in Terminal 2 (normally
`http://127.0.0.1:5173`). The development server proxies `/api/*` to
the backend URL configured in `vite.config.js`; `/backend-health` is proxied to
the API's `/` health route.

## Production API URL

Production builds read `VITE_API_URL` from `.env.production`. Copy
`.env.production.example` to `.env.production` and set the backend origin there
before building a deployment that calls the API directly. For Vercel, leave
`VITE_API_URL` unset so requests use the same-origin rewrites in `vercel.json`;
if you previously set `VITE_API_URL` in the Vercel project settings, remove it
and redeploy. `.env.production` is intentionally ignored by Git.

The default example uses `https://dalton-prep-backend.onrender.com`. The
backend must allow the deployed frontend's origin through CORS.

Management accounts must already have the `founder` or `manager` role in the
backend. The sign-up form intentionally creates `intern` accounts only.

## Verify the connection

With both servers running, the browser developer console shows a status line
for each request, for example:

```text
[api] GET /backend-health -> 200
[api] POST /auth/login -> 200
[api] GET /auth/me -> 200
[api] GET /dashboard/founder -> 200
```

The API terminal should also show its startup message and matching Morgan
request lines, for example:

```text
Server running on port 5000
GET / - 200
POST /api/auth/login 200
GET /api/auth/me 200
GET /api/dashboard/founder 200
```

If the backend is stopped or unreachable, the browser console reports a
`NETWORK ERROR` and the workspace connection indicator changes to **API
offline**. Authentication and data requests use the Vite proxy, so no
development CORS configuration is needed.

## Included workflows

- Role-aware intern and founder/manager dashboards.
- Weekly work and meeting availability, date overrides, and effective daily
  availability (holiday and approved-leave days suppress expected availability
  in the UI).
- Start/end work attendance and management attendance status updates.
- Leave requests, approval/rejection, and cancellation.
- Projects with intern/team assignment and completed-project history.
- Team creation, intern onboarding, and shared holiday management.
- Meeting creation with meeting-window, holiday/leave, and existing-booking
  conflict checks.

The API remains the source of truth for authorization and persisted business
rules. Vite's proxy applies only in local development. Vercel forwards
same-origin `/api/*` and `/backend-health` requests through `vercel.json`;
other production hosts can use `VITE_API_URL` to call the API directly.
