# MealMate 🍽️

**AI-powered meal planning & smart grocery shopping assistant.**

MealMate helps you plan meals, build shopping lists from real recipes, find nearby grocery stores on an interactive map, and track what you've cooked — all in one mobile app.

| Layer | Technology |
|---|---|
| **Frontend** | React Native (Expo SDK 54) + TypeScript + NativeWind |
| **Auth** | Clerk (email/password + Google SSO) |
| **Backend** | FastAPI (Python 3.11+) |
| **Database** | Supabase (PostgreSQL) |
| **Map** | Mapbox Static Images API + `expo-location` |
| **AI** | Google Gemini 1.5 Flash |
| **Recipes** | Spoonacular API |
| **Stores** | Google Places API |

---

## 📱 Key Features

- 🔍 **Recipe Search** — Search dishes by name or cuisine, browse Spoonacular results
- ✅ **Ingredient Checklist** — Check off what you already have, auto-build a "need to buy" list
- 🗺️ **Nearby Stores** — Live map of grocery stores near you (Google Places + Mapbox)
- ❤️ **Favourites** — Save recipes to your wishlist, synced to Supabase
- 🍳 **Cooked History** — Track meals you've completed
- 👤 **Auth** — Sign in / sign up with email or Google (Clerk)

---

## ⚙️ Prerequisites

| Tool | Required Version | Notes |
|---|---|---|
| **Node.js** | **18.x or 20.x** ⚠️ | Node 22+ breaks `@expo/cli`. Use [nvm-windows](https://github.com/coreybutler/nvm-windows) to switch. |
| **npm** | 9+ | Bundled with Node |
| **Python** | 3.11+ | For backend |
| **Expo Go** (phone) | SDK 54 | [iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |

> **Using Node 22?**
> ```powershell
> nvm install 20
> nvm use 20
> ```
> Then restart your terminal before starting Expo.

---

## 🚀 Quick Start

### 1 — Clone & enter the repo

```powershell
git clone <repo-url>
cd MealMate
```

---

### 2 — Backend (FastAPI)

```powershell
# Enter backend folder
cd backend

# Create virtual environment
python -m venv .venv

# Activate (PowerShell)
.venv\Scripts\Activate.ps1
# Activate (macOS / Linux)
# source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy env and fill in your keys
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Start dev server (auto-reload on file save)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend is ready at:** `http://localhost:8000`
**Interactive API docs:** `http://localhost:8000/docs`
**Health check:** `http://localhost:8000/health`

---

### 3 — Frontend (Expo / React Native)

```powershell
# Enter frontend folder (from repo root)
cd frontend

# Install JS dependencies
npm install --legacy-peer-deps

# Copy env and fill in your keys
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Start Metro bundler (local network)
npx expo start

# --- OR use a tunnel (required on school/restricted networks) ---
npx expo start --tunnel

# --- OR clear Metro cache (use when you have bundling issues) ---
npx expo start --clear
npx expo start --tunnel --clear
```

**Then connect:**
- 📱 **Expo Go** — Scan the QR code with the Expo Go app on your phone
- 🤖 **Android emulator** — Press `a` in the terminal
- 🌐 **Web browser** — Press `w` in the terminal

---

### 4 — Expose backend to phone (tunnel)

When running on a physical device (especially on a school/university network), the phone cannot reach `localhost:8000`. Expose the backend with a free Cloudflare tunnel:

```powershell
# In a separate terminal (keep it running)
npx cloudflared tunnel --url http://localhost:8000
```

Copy the `https://xxxx.trycloudflare.com` URL printed in the terminal, then update `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://xxxx.trycloudflare.com
```

Restart Expo with `--clear` to reload the env:

```powershell
npx expo start --tunnel --clear
```

> **Note:** The Cloudflare URL changes every time you restart the tunnel. For a permanent URL, create a free [Cloudflare account](https://cloudflare.com) and use a named tunnel.

---

## 🔑 Environment Variables

### `frontend/.env`

```env
# Backend API — localhost for simulator, tunnel URL for physical device
EXPO_PUBLIC_API_URL=http://localhost:8000

# Mapbox public token (used for map images)
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Supabase — client-safe anon key only
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk — authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### `backend/.env`

```env
# PostgreSQL (optional if using Supabase directly)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/mealmate

# Supabase (Project Settings → API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only, never expose to client

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Google APIs (console.cloud.google.com)
GOOGLE_PLACES_API_KEY=your_google_places_key
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash

# Mapbox (account.mapbox.com)
MAPBOX_ACCESS_TOKEN=your_mapbox_secret_token

# Kroger grocery API (developer.kroger.com)
KROGER_CLIENT_ID=your_kroger_client_id
KROGER_CLIENT_SECRET=your_kroger_client_secret

# Spoonacular recipe API — free tier: 150 req/day (spoonacular.com/food-api)
SPOONACULAR_API_KEY=your_spoonacular_key

# Serper web search (serper.dev)
SERPER_API_KEY=your_serper_key

# Clerk (dashboard.clerk.com)
CLERK_SECRET_KEY=sk_test_...
```

---

## 🛠️ Useful Commands

### Frontend

```powershell
# Check for dependency issues
cd frontend
npx expo-doctor

# TypeScript type check (no emit)
npx tsc --noEmit

# Fix/align Expo SDK dependencies
npx expo install --fix

# Install a new package the Expo-safe way
npx expo install <package-name>

# Hard reset: clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules, .expo
npm install --legacy-peer-deps
npx expo start --clear

# Kill process on a port (e.g. 8081)
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

### Backend

```powershell
# Activate virtualenv (PowerShell)
cd backend
.venv\Scripts\Activate.ps1

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run in background (logs to file)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 `
  --log-level info `
  > uvicorn.log 2> uvicorn.err

# Check health endpoint
Invoke-WebRequest http://localhost:8000/health | Select-Object -ExpandProperty Content

# Install a new Python package and save it
pip install <package>
pip freeze > requirements.txt
```

### Git

```powershell
# See what changed
git status
git diff

# Stage and commit
git add .
git commit -m "your message"

# Push to remote
git push origin main
```

---

## 🗄️ Database (Supabase)

Run the migration SQL in your Supabase project's **SQL Editor**:

```powershell
# File location:
backend/supabase/migrations/001_init.sql
```

Tables created:
- `saved_recipes` — user wishlist / favourites

---

## 🛠️ Troubleshooting

### `CommandError: The bundled native module list from the Expo API is empty`
Node 22+ issue. Fix:
```powershell
nvm install 20 && nvm use 20
# Restart terminal, then:
npx expo start --offline
```

### `Network request failed` on device
The phone can't reach `localhost`. Use a tunnel:
```powershell
# Terminal 1 — backend tunnel
npx cloudflared tunnel --url http://localhost:8000
# Copy the https://xxxx.trycloudflare.com URL → EXPO_PUBLIC_API_URL in frontend/.env

# Terminal 2 — Expo with tunnel
cd frontend && npx expo start --tunnel --clear
```

### Metro port conflict
```powershell
npx expo start --port 8083
```

### Dependency conflicts (`ERESOLVE`)
```powershell
npm install --legacy-peer-deps
```

