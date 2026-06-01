# Chore Tracker

Family chore tracking app with gamification (streaks, milestone wins) for kids.
Runs as a Home Assistant add-on on a Raspberry Pi.

## Stack
- **Backend**: Python + FastAPI + SQLite
- **Frontend**: React (Vite)
- **Hosting**: Home Assistant Add-on (Docker)

## Local Development (without HA)

### Backend
```bash
cd chore-tracker/backend
pip install -r requirements.txt
DB_PATH=./chores.db uvicorn main:app --reload --port 8099
```

### Frontend
```bash
cd chore-tracker/frontend
npm install
npm run dev   # runs on :5173, proxies /api to :8099
```

Open http://localhost:5173

## Deploying to Home Assistant (Pi)

1. **Copy the add-on folder to your Pi**
   - Enable the Samba add-on in HA, then copy `chore-tracker/` (the inner folder)
     to `/addons/chore_tracker/` on your Pi.

2. **Install the add-on**
   - In HA → Settings → Add-ons → Add-on Store
   - Click the ⋮ menu → Check for updates (to detect local add-ons)
   - Find "Chore Tracker" under Local add-ons → Install

3. **Configure**
   - In the add-on's Configuration tab, set:
     - `reminder_time`: e.g. `"08:00"` for 8 AM daily reminder
     - Leave `ha_url` and `ha_token` as defaults (auto-provided inside HA)

4. **Set up Echo announcements**
   - Install the Alexa Media Player integration in HA if not already done
   - Add the automation from `ha_automation_example.yaml` to your HA config

5. **Start the add-on** — access it via the HA sidebar or at `http://<pi-ip>:8099`

## Features
- Parent dashboard: manage kids, chores, assignments, review completions
- Kid view: today's chore list, one-tap completion, streak tracker
- Gamification: fire streak counter, milestone wins modal (7d, 14d, 21d, 30d…)
- Daily Echo reminders via HA automation
- Parent approval flow before streak credit is given
