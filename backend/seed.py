"""
Run with: python seed.py
Wipes and repopulates fireflies.db with demo meetings.
"""
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app import models

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

MEETINGS = [
    {
        "title": "Q3 Product Roadmap Sync",
        "days_ago": 1,
        "participants": ["Ritika Sharma", "Dev Patel", "Amara Singh"],
        "segments": [
            ("Ritika Sharma", "Alright, let's kick off — main goal today is locking the Q3 roadmap."),
            ("Dev Patel", "Sure. I think we should prioritize the search revamp first."),
            ("Amara Singh", "Agreed, but we need design bandwidth before engineering starts."),
            ("Ritika Sharma", "Let's timebox design to two weeks then."),
            ("Dev Patel", "Works for me. I'll draft the technical spec this week."),
        ],
        "summary": "The team aligned on prioritizing the search revamp for Q3, with a two-week design phase preceding engineering work. Dev will draft the technical spec.",
        "action_items": [
            ("Draft technical spec for search revamp", "Dev Patel", False),
            ("Timebox design phase to 2 weeks", "Amara Singh", False),
        ],
        "topics": ["Roadmap Planning", "Search Revamp", "Design Bandwidth"],
    },
    {
        "title": "Customer Feedback Review",
        "days_ago": 3,
        "participants": ["Ritika Sharma", "Neel Kapoor"],
        "segments": [
            ("Neel Kapoor", "We got a lot of feedback on the onboarding flow this month."),
            ("Ritika Sharma", "What's the biggest complaint?"),
            ("Neel Kapoor", "Users say the signup form is too long."),
            ("Ritika Sharma", "Let's cut it down to essential fields only."),
        ],
        "summary": "Customer feedback highlighted friction in the onboarding signup flow, primarily due to excessive form length. The team agreed to reduce the form to essential fields only.",
        "action_items": [
            ("Redesign signup form with fewer fields", "Neel Kapoor", False),
        ],
        "topics": ["Customer Feedback", "Onboarding", "Signup Flow"],
    },
    {
        "title": "Engineering Standup",
        "days_ago": 5,
        "participants": ["Dev Patel", "Amara Singh", "Neel Kapoor"],
        "segments": [
            ("Dev Patel", "Yesterday I finished the auth refactor, today I'm on the API rate limiter."),
            ("Amara Singh", "I'm blocked on the design tokens file, should have it by noon."),
            ("Neel Kapoor", "No blockers, continuing on the notifications service."),
        ],
        "summary": "Standard daily standup. Dev completed the auth refactor and is starting on the API rate limiter. Amara is finishing design tokens. Neel continues on notifications with no blockers.",
        "action_items": [
            ("Finish design tokens file", "Amara Singh", True),
            ("Implement API rate limiter", "Dev Patel", False),
        ],
        "topics": ["Standup", "Auth Refactor", "Rate Limiting"],
    },
    {
        "title": "Marketing Launch Planning",
        "days_ago": 8,
        "participants": ["Ritika Sharma", "Amara Singh", "Priya Verma"],
        "segments": [
            ("Priya Verma", "Launch date is set for the 15th, we need assets by the 10th."),
            ("Amara Singh", "I can have the landing page mockups ready by Thursday."),
            ("Ritika Sharma", "Great, let's also plan a teaser post for social."),
            ("Priya Verma", "I'll draft the social calendar this week."),
        ],
        "summary": "The team confirmed a launch date of the 15th, with all marketing assets due by the 10th. Amara will deliver landing page mockups by Thursday, and Priya will draft the social media calendar.",
        "action_items": [
            ("Deliver landing page mockups", "Amara Singh", False),
            ("Draft social media calendar", "Priya Verma", False),
            ("Finalize launch assets", "Priya Verma", False),
        ],
        "topics": ["Launch Planning", "Marketing Assets", "Social Media"],
    },
]

for m in MEETINGS:
    meeting = models.Meeting(
        title=m["title"],
        date=datetime.utcnow() - timedelta(days=m["days_ago"]),
        duration_sec=len(m["segments"]) * 5,
        audio_url=None,  # plug a sample mp3 URL here if you add a player
    )
    db.add(meeting)
    db.flush()

    for name in m["participants"]:
        db.add(models.Participant(meeting_id=meeting.id, name=name))

    t = 0.0
    for speaker, text in m["segments"]:
        db.add(models.TranscriptSegment(
            meeting_id=meeting.id, speaker=speaker,
            start_time=t, end_time=t + 5, text=text
        ))
        t += 5

    db.add(models.Summary(meeting_id=meeting.id, overview_text=m["summary"]))

    for text, assignee, done in m["action_items"]:
        db.add(models.ActionItem(
            meeting_id=meeting.id, text=text, assignee=assignee, is_completed=done
        ))

    for label in m["topics"]:
        db.add(models.Topic(meeting_id=meeting.id, label=label))

db.commit()
print(f"Seeded {len(MEETINGS)} meetings.")
