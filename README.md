# HUMAEIN RCM Frontend

A professional React-based frontend for the Revenue Cycle Management (RCM) validation platform, built with Vite for fast local development and production builds.

## Features

- **Authentication**: JWT-based login with token persistence
- **Dashboard**: Charts and tables with pagination and filters
- **File Upload**: Drag-and-drop claims upload with progress
- **Audit Logs**: Searchable and paginated audit trail
- **Responsive UI**: Tailwind CSS, accessible components
- **Notifications**: Toast feedback for actions and errors

## Tech Stack

- **React 19** (with hooks)
- **React Router 7**
- **Vite 7** (bundler/dev server)
- **Tailwind CSS 3**
- **Axios** (API client)
- **Chart.js + react-chartjs-2**
- **React Hook Form**, **React Toastify**, **Headless UI**, **Heroicons**

## Requirements

- Node.js 18+
- npm (or yarn/pnpm)
- Backend API available

## Environment Configuration

This app reads its API base URL from `VITE_API_URL`. If not provided, it falls back to:

- Production builds: `https://rcm-backend-1.onrender.com`
- Development (`npm run dev`): `http://localhost:8000`

You can override in any environment via `.env` files or shell env:

```bash
# .env (development)
VITE_API_URL=http://localhost:8000

# .env.production (production)
VITE_API_URL=https://your-production-host
```

The resolution logic is implemented in `src/services/api.js`.

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment (optional)

By default, development uses `http://localhost:8000`. To change:

```bash
echo "VITE_API_URL=http://localhost:8001" > .env
```

### 3) Run the app

```bash
npm run dev
```

Open http://localhost:5173

## Available Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Build for production (outputs to `dist/`)
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint on the project

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx       # App shell (sidebar/header)
│   └── ClaimDetailModal.jsx
├── contexts/            # Context providers
│   └── AuthContext.jsx  # Authentication state
├── pages/               # Route components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Upload.jsx
│   └── AuditLogs.jsx
├── services/            # API layer
│   └── api.js           # Axios instance + endpoints
├── App.jsx              # Routes
└── main.jsx             # App bootstrap
```

## API Integration

The frontend currently calls these backend endpoints (see `src/services/api.js`):

- `POST /api/auth/login` — Authenticate user, returns JWT
- `POST /api/auth/logout` — Logout (optional server-side invalidation)
- `POST /api/upload` — Upload claims file (multipart/form-data)
- `POST /api/validate` — Re-validate claims
- `GET  /api/results` — Paginated results and chart data
- `GET  /api/audit` — Audit log listing
- `POST /api/agent` — AI agent query for claim details

Notes:
- All requests are prefixed by the configured base URL.
- An Authorization header with `Bearer <token>` is sent automatically if a token exists in `localStorage`.
- On 401 responses, the app clears auth and redirects to `/login`.

## Authentication Flow

1. User logs in from `Login.jsx` using username and password (and optional `tenant_id`).
2. On success, token and minimal user info are stored in `localStorage`.
3. An axios request interceptor injects the `Authorization` header.
4. A response interceptor handles unauthorized responses and performs a cleanup + redirect.

## Styling & UX

- Tailwind for layout, spacing, and responsive design
- Clear status colors (success/warn/error) used across UI
- Toasts for async action feedback
- Accessible components and keyboard-friendly controls

## Building & Deployment

1. Build the production bundle:
```bash
npm run build
```
2. Deploy the `dist/` directory to your hosting provider (e.g., NGINX, Netlify, Vercel, S3/CloudFront).
3. Ensure your environment exposes `VITE_API_URL` if you need a custom API host.

Example NGINX location for SPA:
```nginx
location / {
  try_files $uri /index.html;
}
```

## Troubleshooting

- "Network Error" or CORS issues:
  - Verify `VITE_API_URL` is reachable from the browser
  - Configure CORS on the backend to allow your frontend origin
- 401 Unauthorized after login:
  - Confirm token is stored in `localStorage`
  - Ensure subsequent requests include `Authorization: Bearer <token>` (handled by interceptor)
- Blank page in production:
  - Use `npm run preview` locally to test built assets
  - Check base path and host configuration on your CDN/server
- Wrong API host:
  - Confirm the `baseURL` computed in `src/services/api.js` matches your environment

## Contributing

1. Follow existing code style and ESLint rules
2. Prefer descriptive names for components and variables
3. Handle errors and loading states explicitly
4. Test across viewport sizes and browsers
5. Keep accessibility in mind (labels, roles, focus states)