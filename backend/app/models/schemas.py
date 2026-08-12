from pydantic import BaseModel
from typing import List, Optional

class Incident(BaseModel):
    incident_id: str
    title: str
    type: str
    timestamp: str
    system: str
    severity: str
    status: str  # Active, Investigated, Resolved
    indicators: List[str]
    description: str
    attack_behavior: str
    root_cause: Optional[str] = None
    analyst_investigation: Optional[str] = None
    actions_attempted: List[str] = []
    successful_actions: List[str] = []
    failed_actions: List[str] = []
    resolution: Optional[str] = None
    resolution_time: Optional[int] = None
    outcome: Optional[str] = None
    analyst_notes: Optional[str] = None
    lessons_learned: Optional[str] = None

class IncidentCreate(BaseModel):
    title: str
    type: str
    system: str
    severity: str
    description: str
    indicators: List[str]
    attack_behavior: str

class IncidentResolveRequest(BaseModel):
    actions_taken: List[str]
    resolution: str
    resolution_time: int
    outcome: str
    lessons_learned: str

class MemoryCard(BaseModel):
    incident_id: str
    title: str
    relevance: int
    type: str
    attack: str
    root_cause: str
    successful_remediation: str
    failed_remediation: str
    outcome: str
    resolution_time: int

class AIRecommendation(BaseModel):
    recommendation_id: str
    incident_id: str
    findings: List[str]
    recommendations: List[str]
    confidence: int
    historical_evidence_count: int
    previous_successful_strategy: str
    reasoning: str

class Pattern(BaseModel):
    pattern_id: str
    title: str
    incidents: List[str]
    confidence: int
    observation: str
    recommendation: str

class LearningJourneyItem(BaseModel):
    interaction_id: str
    title: str
    description: str
    learned_fact: str
    outcome_impact: str
    step_number: int

class DashboardStats(BaseModel):
    active_incidents: int
    resolved_incidents: int
    memory_facts: int
    patterns_detected: int
    average_resolution_time: int
