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

class Milestone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(description="The milestone task or objective")
    target_year: int = Field(description="Suggested year to achieve this milestone")
    completed: bool = False

class SMARTGoal(BaseModel):
    specific: str
    measurable: str
    achievable: str
    relevant: str
    time_bound: str
    polished_title: str

class DreamEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(description="A concise title for the dream")
    category: DreamCategory = Field(description="The category this dream best fits into")
    suggested_target_year: int = Field(description="A realistic four-digit year to achieve this")
    completed: bool = False
    is_polished: bool = False
    smart_data: Optional[SMARTGoal] = None
    milestones: List[Milestone] = Field(default_factory=list)

class DreamCollection(BaseModel):
    dreams: List[DreamEntry]

class DreamUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[DreamCategory] = None
    suggested_target_year: Optional[int] = None
    completed: Optional[bool] = None
    is_polished: Optional[bool] = None
    smart_data: Optional[SMARTGoal] = None
    milestones: Optional[List[Milestone]] = None
