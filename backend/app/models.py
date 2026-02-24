from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
import uuid

class DreamCategory(str, Enum):
    CAREER = "Career & Business"
    FINANCE = "Finance & Wealth"
    HEALTH = "Health & Wellness"
    FAMILY = "Relationships & Family"
    TRAVEL = "Travel & Adventure"
    SKILLS = "Skills & Knowledge"
    LIFESTYLE = "Lifestyle & Hobbies"
    OTHER = "Other"

class DreamInput(BaseModel):
    text: str = Field(description="The user's raw dream text")


class Milestone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(description="The milestone task or objective")
    target_year: int = Field(description="Suggested year to achieve this milestone")
    completed: bool = False

class SMARTGoal(BaseModel):
    specific: str = ""
    measurable: str = ""
    achievable: str = ""
    relevant: str = ""
    time_bound: str = ""
    polished_title: str = ""

# Max lengths aligned with frontend constants (lib/constants.ts)
DREAM_TITLE_MAX_LENGTH = 500
JOURNAL_ENTRY_CONTENT_MAX_LENGTH = 10000


class JournalEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str = Field(..., max_length=JOURNAL_ENTRY_CONTENT_MAX_LENGTH)
    created_at: str
    updated_at: Optional[str] = None


class DreamEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(
        ...,
        max_length=DREAM_TITLE_MAX_LENGTH,
        description="A concise title for the dream",
    )
    category: DreamCategory = Field(description="The category this dream best fits into")
    suggested_target_year: int = Field(
        ...,
        ge=2000,
        le=2100,
        description="A realistic four-digit year to achieve this",
    )
    completed: bool = False
    is_polished: bool = False
    smart_data: Optional[SMARTGoal] = None
    milestones: List[Milestone] = Field(default_factory=list)
    journal_entries: List[JournalEntry] = Field(default_factory=list)
    notes: Optional[str] = None


class DreamCollection(BaseModel):
    dreams: List[DreamEntry]

class DreamUpdate(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    category: Optional[DreamCategory] = None
    suggested_target_year: Optional[int] = None
    completed: Optional[bool] = None
    is_polished: Optional[bool] = None
    smart_data: Optional[SMARTGoal] = None
    milestones: Optional[List[Milestone]] = None
    journal_entries: Optional[List[JournalEntry]] = None
    notes: Optional[str] = None

