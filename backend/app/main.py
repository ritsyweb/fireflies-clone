from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime

from . import models, schemas
from .database import engine, get_db, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fireflies Clone API")

# Allow the Next.js frontend (localhost:3000) to call this API during dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your deployed frontend URL in prod
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Meetings ----------

@app.get("/meetings", response_model=list[schemas.MeetingListOut])
def list_meetings(
    q: Optional[str] = None,           # search by title
    participant: Optional[str] = None, # filter by participant name
    sort: str = "recent",              # "recent" or "oldest"
    db: Session = Depends(get_db),
):
    query = db.query(models.Meeting)
    if q:
        query = query.filter(models.Meeting.title.ilike(f"%{q}%"))
    if participant:
        query = query.join(models.Participant).filter(
            models.Participant.name.ilike(f"%{participant}%")
        )
    query = query.order_by(
        models.Meeting.date.desc() if sort == "recent" else models.Meeting.date.asc()
    )
    return query.all()


@app.post("/meetings", response_model=schemas.MeetingDetailOut)
def create_meeting(payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    meeting = models.Meeting(title=payload.title, date=payload.date)
    db.add(meeting)
    db.flush()  # get meeting.id before commit

    for name in payload.participants:
        db.add(models.Participant(meeting_id=meeting.id, name=name))

    # Very naive "parse pasted transcript" mock:
    # expects lines like: "Speaker: text" — good enough for a seeded/demo flow
    if payload.raw_transcript:
        t = 0.0
        for line in payload.raw_transcript.strip().splitlines():
            if ":" not in line:
                continue
            speaker, text = line.split(":", 1)
            db.add(models.TranscriptSegment(
                meeting_id=meeting.id, speaker=speaker.strip(),
                start_time=t, end_time=t + 5, text=text.strip()
            ))
            t += 5
        meeting.duration_sec = int(t)
        db.add(models.Summary(
            meeting_id=meeting.id,
            overview_text="Summary pending — mock/LLM generation can be triggered here."
        ))

    db.commit()
    db.refresh(meeting)
    return meeting


@app.get("/meetings/{meeting_id}", response_model=schemas.MeetingDetailOut)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).get(meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    return meeting


@app.patch("/meetings/{meeting_id}", response_model=schemas.MeetingDetailOut)
def update_meeting(meeting_id: int, payload: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).get(meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")

    if payload.title is not None:
        meeting.title = payload.title
    if payload.date is not None:
        meeting.date = payload.date
    if payload.participants is not None:
        db.query(models.Participant).filter_by(meeting_id=meeting_id).delete()
        for name in payload.participants:
            db.add(models.Participant(meeting_id=meeting_id, name=name))

    db.commit()
    db.refresh(meeting)
    return meeting


@app.delete("/meetings/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).get(meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"ok": True}


# ---------- Transcript search ----------

@app.get("/meetings/{meeting_id}/transcript/search", response_model=list[schemas.TranscriptSegmentOut])
def search_transcript(meeting_id: int, q: str = Query(...), db: Session = Depends(get_db)):
    return db.query(models.TranscriptSegment).filter(
        models.TranscriptSegment.meeting_id == meeting_id,
        models.TranscriptSegment.text.ilike(f"%{q}%"),
    ).all()


# ---------- Action items ----------

@app.post("/meetings/{meeting_id}/action-items", response_model=schemas.ActionItemOut)
def create_action_item(meeting_id: int, payload: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    item = models.ActionItem(meeting_id=meeting_id, text=payload.text, assignee=payload.assignee)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.patch("/meetings/{meeting_id}/action-items/{item_id}", response_model=schemas.ActionItemOut)
def update_action_item(meeting_id: int, item_id: int, payload: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter_by(id=item_id, meeting_id=meeting_id).first()
    if not item:
        raise HTTPException(404, "Action item not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/meetings/{meeting_id}/action-items/{item_id}")
def delete_action_item(meeting_id: int, item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter_by(id=item_id, meeting_id=meeting_id).first()
    if not item:
        raise HTTPException(404, "Action item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
