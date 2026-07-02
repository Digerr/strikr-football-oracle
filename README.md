# ⚽ STRIKR — AI Football Oracle

Premium Telegram Mini App for AI-powered football predictions. Live matches, deep analytics, confidence meters and real-time insights — all in your Telegram.

![STRIKR](https://img.shields.io/badge/STRIKR-AI%20Football%20Oracle-00ff88?style=for-the-badge&logo=football)

## ✨ Features

### 🎨 Visual Effects
- **Glass morphism** — translucent cards with backdrop blur
- **Parallax** — Hero section with floating gradient blobs
- **Shimmer** — sweeping light on buttons & confidence bars
- **Gradient shift** — animated gradient on heading text
- **Pulse glow** — pulsing LIVE indicators
- **Card tilt** — 3D tilt toward cursor with radial glow
- **Ripple** — wave effect on button clicks
- **Custom scrollbar** — green→cyan→violet gradient

### 🏗️ Architecture
- **Next.js 16** with App Router + TypeScript
- **Tailwind CSS 4** + shadcn/ui component library
- **Framer Motion** for all animations
- **Telegram WebApp SDK** integration

### 📱 4 Tabs
1. **Главная** — live matches, top AI predictions, hot matches
2. **Матчи** — all matches with filters (All / Live / Upcoming / Hot) + league chips
3. **Прогнозы** — AI engine stats + predictions sorted by confidence
4. **Рейтинг** — capper profile, achievements, top-10 leaderboard

### ⚽ Data
- 12 real matches from 6 leagues (La Liga, EPL, Bundesliga, Serie A, Ligue 1, Primeira Liga)
- 20 real teams with last-5 form
- AI predictions: 1X2 probabilities, expected score, Over 2.5, BTTS, confidence
- H2H (head-to-head) history per match
- Live match stats (possession, shots, xG, corners, fouls, cards)

## 🔌 Live Data Integration

The app ships with curated data so it works out-of-the-box. To enable real-time data:

### Option 1: football-data.org (recommended, free)
1. Register at https://www.football-data.org/client/register
2. Set `FOOTBALL_DATA_API_KEY` env var
3. Implement transformation in `src/lib/football-data.ts` → `fetchLiveMatchesFromApi()`

### Option 2: Other free APIs
- TheSportsDB: https://www.thesportsdb.com/api.php
- OpenLigaDB: https://www.openligadb.de/
- api-football (RapidAPI): 100 req/day free

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git remote add origin https://github.com/USERNAME/strikr.git
git push -u origin main

# 2. Import on Vercel
# Go to vercel.com/new, select the repo, deploy

# 3. Set env vars (optional)
# FOOTBALL_DATA_API_KEY in Vercel project settings
```

## 📲 Connect to Telegram

1. Create a bot via [@BotFather](https://t.me/BotFather) → `/newbot`
2. Send `/newapp` to BotFather, select your bot
3. Provide the Vercel URL as the Mini App URL
4. Configure menu button via Bot API:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setChatMenuButton" \
     -H "Content-Type: application/json" \
     -d '{"menu_button":{"type":"web_app","text":"STRIKR","web_app":{"url":"https://your-app.vercel.app"}}}'
   ```

## 📁 Structure

```
src/
├── app/
│   ├── page.tsx              # Main page with tab navigation
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # All visual effects (glass, shimmer, etc.)
│   └── api/
│       ├── matches/route.ts  # GET /api/matches?filter=live|upcoming|hot|all
│       └── predictions/route.ts
├── components/
│   └── strikr/               # STRIKR UI components
│       ├── Logo.tsx
│       ├── GlassCard.tsx     # Glass morphism + tilt
│       ├── ShimmerButton.tsx # Shimmer + ripple
│       ├── ConfidenceBar.tsx
│       ├── Hero.tsx          # Parallax hero
│       ├── Header.tsx        # Glass sticky header
│       ├── BottomNav.tsx     # Telegram-style nav
│       ├── MatchCard.tsx
│       ├── MatchDetailModal.tsx
│       └── StatsView.tsx
└── lib/
    └── football-data.ts      # Data + AI predictions + API integration
```

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--strikr-green` | `#00ff88` | Primary, confidence |
| `--strikr-cyan` | `#22d3ee` | Accents, xG |
| `--strikr-violet` | `#a855f7` | AI engine, away team |
| `--strikr-orange` | `#ff6b35` | Hot matches, draws |
| `--strikr-red` | `#ff3366` | LIVE indicator |
| `--strikr-gold` | `#ffb800` | Achievements, hot |

## 📄 License

MIT — built with ❤️ for football fans.
