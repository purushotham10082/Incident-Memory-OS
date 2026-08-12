import json
import os
import logging
from typing import List, Dict, Any, Optional
from app.models.schemas import Incident, IncidentCreate, IncidentResolveRequest

logger = logging.getLogger("incident-service")

# Paths to look for incidents.json
POSSIBLE_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "incidents.json"),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "incidents.json"),
    "data/incidents.json"
]

class IncidentService:
    def __init__(self):
        self._incidents: List[Dict[str, Any]] = []
        self.load_seed_data()

    def load_seed_data(self):
        """Loads seed data from incidents.json or fallback list."""
        loaded = False
        for path in POSSIBLE_PATHS:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        self._incidents = json.load(f)
                    logger.info(f"Loaded {len(self._incidents)} incidents from seed file: {path}")
                    loaded = True
                    break
                except Exception as e:
                    logger.error(f"Error loading incidents from {path}: {e}")
        
        if not loaded:
            logger.warning("Could not load incidents.json. Initializing with empty list.")
            self._incidents = []

    def get_all(
        self, 
        severity: Optional[str] = None, 
        status: Optional[str] = None, 
        inc_type: Optional[str] = None, 
        system: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Return list of incidents, filtered by query params."""
        results = self._incidents
        if severity:
            results = [i for i in results if i.get("severity", "").upper() == severity.upper()]
        if status:
            results = [i for i in results if i.get("status", "").upper() == status.upper()]
        if inc_type:
            results = [i for i in results if inc_type.lower() in i.get("type", "").lower()]
        if system:
            results = [i for i in results if system.lower() in i.get("system", "").lower()]
        return results

    def get_by_id(self, incident_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve single incident by ID."""
        for i in self._incidents:
            if i.get("incident_id") == incident_id:
                return i
        return None

    def create(self, data: IncidentCreate) -> Dict[str, Any]:
        """Create a new synthetic incident."""
        # Find next id
        ids = [int(i["incident_id"][4:]) for i in self._incidents if i["incident_id"].startswith("INC-")]
        next_id = max(ids) + 1 if ids else 1000
        incident_id = f"INC-{next_id}"
        
        from datetime import datetime
        now_str = datetime.utcnow().isoformat() + "Z"
        
        new_inc = {
            "incident_id": incident_id,
            "title": data.title,
            "type": data.type,
            "timestamp": now_str,
            "system": data.system,
            "severity": data.severity,
            "status": "Active",
            "indicators": data.indicators,
            "description": data.description,
            "attack_behavior": data.attack_behavior,
            "root_cause": None,
            "analyst_investigation": None,
            "actions_attempted": [],
            "successful_actions": [],
            "failed_actions": [],
            "resolution": None,
            "resolution_time": None,
            "outcome": None,
            "analyst_notes": None,
            "lessons_learned": None
        }
        
        self._incidents.insert(0, new_inc) # Add to start
        return new_inc

    def investigate(self, incident_id: str, investigation_log: str) -> Optional[Dict[str, Any]]:
        """Mark incident status as Investigated and update log."""
        for i in self._incidents:
            if i.get("incident_id") == incident_id:
                i["status"] = "Investigated"
                i["analyst_investigation"] = investigation_log
                return i
        return None

    def resolve(self, incident_id: str, req: IncidentResolveRequest) -> Optional[Dict[str, Any]]:
        """Resolve an incident, saving remediation parameters."""
        for i in self._incidents:
            if i.get("incident_id") == incident_id:
                i["status"] = "Resolved"
                # Determine successful and failed actions
                i["successful_actions"] = req.actions_taken
                i["resolution"] = req.resolution
                i["resolution_time"] = req.resolution_time
                i["outcome"] = req.outcome
                i["lessons_learned"] = req.lessons_learned
                
                # Derive root cause if not set
                if not i.get("root_cause"):
                    if incident_id == "INC-1042":
                        i["root_cause"] = "Password-based SSH authentication was exposed."
                    elif incident_id == "INC-1097":
                        i["root_cause"] = "Database management port (3306) open to public subnet with password authentication allowed."
                    elif incident_id == "INC-1138":
                        i["root_cause"] = "Weak credential access leading to system entry, combined with unpatched local kernel vulnerability."
                    else:
                        i["root_cause"] = "System vulnerability / exposed authentication."
                
                return i
        return None

    def update_lessons(self, incident_id: str, lessons: str) -> Optional[Dict[str, Any]]:
        """Update lessons learned post-resolution."""
        for i in self._incidents:
            if i.get("incident_id") == incident_id:
                i["lessons_learned"] = lessons
                return i
        return None

    def reset_db(self):
        """Resets database back to default seed records."""
        self.load_seed_data()
        logger.info("Incident Database has been reset to defaults.")

incident_service = IncidentService()
