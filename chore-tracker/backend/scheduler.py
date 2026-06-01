"""
Daily reminder scheduler.
Reads config from env vars (set by HA add-on options) and calls
the HA REST API to trigger an Alexa announcement.
"""
import os
import httpx
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from database import SessionLocal
from models import Kid, ChoreAssignment, Chore
from streak import chores_due_on
from datetime import date

HA_URL = os.environ.get("HA_URL", "http://supervisor/core")
HA_TOKEN = os.environ.get("SUPERVISOR_TOKEN", "")  # injected automatically in add-on


def send_reminder():
    """Build a per-kid reminder message and fire it at HA."""
    db = SessionLocal()
    try:
        kids = db.query(Kid).all()
        messages = []
        today = date.today()
        for kid in kids:
            due = chores_due_on(kid.id, today, db)
            if due:
                chore_names = []
                for chore_id in due:
                    chore = db.query(Chore).filter(Chore.id == chore_id).first()
                    if chore:
                        chore_names.append(chore.title)
                if chore_names:
                    chore_list = ", ".join(chore_names)
                    messages.append(f"{kid.name} has {len(chore_names)} chore{'s' if len(chore_names) > 1 else ''} today: {chore_list}.")

        if not messages:
            return

        full_message = " ".join(messages)
        _fire_ha_announcement(full_message)
    finally:
        db.close()


def _fire_ha_announcement(message: str):
    """
    Calls the HA REST API to fire an event that your HA automation can listen to.
    Set up an automation in HA triggered by event_type: chore_reminder.
    """
    if not HA_TOKEN:
        print(f"[Chore Tracker] Reminder (no HA token configured): {message}")
        return

    headers = {
        "Authorization": f"Bearer {HA_TOKEN}",
        "Content-Type": "application/json",
    }
    try:
        resp = httpx.post(
            f"{HA_URL}/api/events/chore_reminder",
            json={"message": message},
            headers=headers,
            timeout=10,
        )
        resp.raise_for_status()
        print(f"[Chore Tracker] Reminder fired: {message}")
    except Exception as e:
        print(f"[Chore Tracker] Failed to fire reminder: {e}")


def start_scheduler():
    reminder_time = os.environ.get("REMINDER_TIME", "08:00")
    try:
        hour, minute = reminder_time.split(":")
    except ValueError:
        hour, minute = "8", "0"

    scheduler = BackgroundScheduler()
    scheduler.add_job(
        send_reminder,
        CronTrigger(hour=int(hour), minute=int(minute)),
        id="daily_reminder",
        replace_existing=True,
    )
    scheduler.start()
    print(f"[Chore Tracker] Reminder scheduler started — fires at {hour}:{minute} daily")
