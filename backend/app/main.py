import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import json

from app.config import settings
from app.models.schemas import (
    Incident, IncidentCreate, IncidentResolveRequest,
    AIRecommendation, MemoryCard, Pattern, LearningJourneyItem,
    DashboardStats
)
from app.services.incident_service import incident_service
from app.hindsight.service import hindsight_service
from app.agents.llm_service import llm_service

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("main")

app = FastAPI(
    title="Incident Memory OS API",
    description="AI-powered security incident response agent backed by persistent Hindsight memory.",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon demo ease, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecallRequest(BaseModel):
    query: str

class ReflectRequest(BaseModel):
    query: str

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "hindsight": {
            "mode": "fallback" if hindsight_service.is_fallback else "live",
            "bank_id": hindsight_service.bank_id,
            "api_url": settings.hindsight_api_url or "None"
        },
        "llm": {
            "provider": settings.llm_provider,
            "model": settings.llm_model
        }
    }

@app.get("/api/dashboard", response_model=DashboardStats)
def get_dashboard_stats():
    all_inc = incident_service.get_all()
    active = len([i for i in all_inc if i.get("status") != "Resolved"])
    resolved = len([i for i in all_inc if i.get("status") == "Resolved"])
    
    # Calculate average resolution time
    resolved_times = [i.get("resolution_time") for i in all_inc if i.get("status") == "Resolved" and i.get("resolution_time") is not None]
    avg_time = int(sum(resolved_times) / len(resolved_times)) if resolved_times else 14
    
    # Facts in Hindsight (base count 184 + mock db size)
    fallback_count = len(hindsight_service._mock_db)
    facts_count = 184 + fallback_count
    
    return DashboardStats(
        active_incidents=active,
        resolved_incidents=resolved,
        memory_facts=facts_count,
        patterns_detected=4,  # Structured pattern count
        average_resolution_time=avg_time
    )

@app.get("/api/incidents", response_model=List[Incident])
def get_incidents(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    system: Optional[str] = None
):
    return incident_service.get_all(severity=severity, status=status, inc_type=type, system=system)

@app.get("/api/incidents/{incident_id}", response_model=Incident)
def get_incident(incident_id: str):
    inc = incident_service.get_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@app.post("/api/incidents", response_model=Incident)
def create_incident(data: IncidentCreate):
    return incident_service.create(data)

@app.post("/api/incidents/{incident_id}/investigate")
def investigate_incident(incident_id: str):
    inc = incident_service.get_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    logger.info(f"AI Agent starting investigation for {incident_id}")
    
    # Step 1: Recall related memories from Hindsight
    # Construct query focusing on incident type, system, and behavior
    recall_query = f"Incident type: {inc['type']}. System: {inc['system']}. Behavior: {inc['attack_behavior']}"
    raw_memories = hindsight_service.recall_memories(recall_query)
    
    # Step 2: Hindsight Reflection
    reflection = hindsight_service.reflect_on_memories(recall_query)
    
    # Step 3: Run LLM Reasoning to generate recommendation
    recommendation = llm_service.generate_investigation(
        incident_id=incident_id,
        incident_details=inc,
        recalled_memories=raw_memories,
        reflection=reflection
    )
    
    # Format recalled memories into structured MemoryCard models for UI
    memory_cards = []
    for idx, mem in enumerate(raw_memories):
        try:
            mem_data = json.loads(mem["content"])
            # Ensure required memory card fields exist
            memory_cards.append(MemoryCard(
                incident_id=mem_data.get("incident_id", f"HIST-{idx}"),
                title=mem_data.get("title", f"Prior {mem_data.get('type', 'Incident')}"),
                relevance=int(mem["score"] * 100),
                type=mem_data.get("type", "Security Anomaly"),
                attack=mem_data.get("attack_behavior", mem_data.get("type", "Unknown")),
                root_cause=mem_data.get("root_cause", "Unspecified"),
                successful_remediation=", ".join(mem_data.get("successful_actions", ["IP Blocking"])),
                failed_remediation=", ".join(mem_data.get("failed_actions", ["None"])),
                outcome=mem_data.get("outcome", "Contained"),
                resolution_time=mem_data.get("resolution_time", 15)
            ))
        except Exception as e:
            logger.error(f"Error parsing memory content: {e}. Content: {mem.get('content')}")
            # Non-json parsing fallback
            memory_cards.append(MemoryCard(
                incident_id=f"MEM-{idx}",
                title="Historical Log Entry",
                relevance=int(mem["score"] * 100),
                type="General",
                attack="Raw text memory match",
                root_cause="Unknown",
                successful_remediation="Inspect system configuration",
                failed_remediation="None",
                outcome="Mitigated",
                resolution_time=20
            ))
            
    # Mark status as Investigated
    incident_service.investigate(incident_id, f"AI Agent run completed. Identified {len(memory_cards)} past references.")
    
    return {
        "incident": incident_service.get_by_id(incident_id),
        "recommendation": recommendation,
        "memories": memory_cards,
        "reflection": reflection
    }

@app.post("/api/incidents/{incident_id}/approve")
def approve_recommendation(incident_id: str):
    inc = incident_service.get_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    logger.info(f"Human approved remediation for {incident_id}")
    
    # Return simulated remediation status logs
    if incident_id == "INC-1042":
        logs = [
            "Source IP 198.51.100.42 blocked via firewall rules.",
            "Reconfigured /etc/ssh/sshd_config (PasswordAuthentication=no).",
            "Enabled Fail2ban service on port 22.",
            "SSH service reloaded successfully."
        ]
    elif incident_id == "INC-1097":
        logs = [
            "Modified security groups to block direct public access to prod-db-02 on port 3306.",
            "Configured wireguard VPN tunnel mapping for database admin role.",
            "Enforced key-based authentication credentials.",
            "Enabled login attempts auditing profile."
        ]
    elif incident_id == "INC-1138":
        logs = [
            "Isolated host 'production-api' using AWS security group isolation rule.",
            "Reverted unauthorized modifications to /etc/sudoers.",
            "Revoked newly added backdoor service accounts.",
            "Initiated system kernel upgrade payload to patch privilege escalation path.",
            "Redeployed Docker stack container."
        ]
    else:
        logs = [
            "Initiated isolation of affected system host.",
            "Enforced authentication credential rotations.",
            "Remediation successfully simulated."
        ]
        
    return {
        "status": "approved",
        "simulated_logs": logs
    }

@app.post("/api/incidents/{incident_id}/resolve")
def resolve_incident(incident_id: str, req: IncidentResolveRequest):
    inc = incident_service.get_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    resolved_inc = incident_service.resolve(incident_id, req)
    logger.info(f"Incident {incident_id} marked as RESOLVED.")
    return resolved_inc

@app.post("/api/incidents/{incident_id}/retain")
def retain_incident_memory(incident_id: str):
    inc = incident_service.get_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    if inc["status"] != "Resolved":
        raise HTTPException(status_code=400, detail="Cannot retain memory for unresolved incident")
        
    logger.info(f"Retaining incident experience in Hindsight for {incident_id}")
    
    # Construct a structured experience block to store in memory
    experience_data = {
        "incident_id": inc["incident_id"],
        "title": inc["title"],
        "type": inc["type"],
        "system": inc["system"],
        "attack_behavior": inc["attack_behavior"],
        "root_cause": inc["root_cause"],
        "actions_attempted": inc["actions_attempted"],
        "successful_actions": inc["successful_actions"],
        "failed_actions": inc["failed_actions"],
        "resolution": inc["resolution"],
        "resolution_time": inc["resolution_time"],
        "outcome": inc["outcome"],
        "lessons_learned": inc["lessons_learned"]
    }
    
    content_str = json.dumps(experience_data)
    result = hindsight_service.retain_memory(content_str)
    
    return {
        "status": "retained",
        "hindsight_result": result,
        "memory_details": experience_data
    }

@app.post("/api/memory/recall")
def direct_recall(req: RecallRequest):
    return hindsight_service.recall_memories(req.query)

@app.post("/api/memory/reflect")
def direct_reflect(req: ReflectRequest):
    return {"reflection": hindsight_service.reflect_on_memories(req.query)}

@app.get("/api/memory/stats")
def get_memory_stats():
    fallback_count = len(hindsight_service._mock_db)
    return {
        "bank_id": hindsight_service.bank_id,
        "mode": "fallback" if hindsight_service.is_fallback else "live",
        "memory_fact_count": 184 + fallback_count,
        "custom_retained_count": fallback_count
    }

@app.get("/api/patterns", response_model=List[Pattern])
def get_patterns():
    return [
        Pattern(
            pattern_id="PAT-01",
            title="Recurring Credential Attack",
            incidents=["INC-1042", "INC-1097", "INC-1138"],
            confidence=91,
            observation="Rotating proxy IP addresses are increasingly associated with credential sprays, followed by privilege escalation attempts.",
            recommendation="Apply rate limiting and enforce key-based SSH immediately. Flag and escalate incidents involving credential sprays from rotating IP sources."
        ),
        Pattern(
            pattern_id="PAT-02",
            title="Samba Ransomware Spread Pattern",
            incidents=["INC-1005", "INC-1115"],
            confidence=85,
            observation="Malware compromises a single domain-joined workstation, which then targets internal network fileshares using local user Samba permissions.",
            recommendation="Isolate infected workstations immediately. Do not reboot fileservers, as workstation will simply reconnect. Rely on immutable backups."
        ),
        Pattern(
            pattern_id="PAT-03",
            title="Exposed Sandbox DNS Leaks",
            incidents=["INC-1008", "INC-1038", "INC-1112"],
            confidence=78,
            observation="Staging and sandbox environments routinely expose internal APIs, metrics, and folders due to default configurations in docker ports or security groups.",
            recommendation="Audit security groups using automation. Bind Docker container ports to localhost 127.0.0.1 instead of default 0.0.0.0."
        ),
        Pattern(
            pattern_id="PAT-04",
            title="OAuth Redirect Redirection Hijack",
            incidents=["INC-1022", "INC-1077", "INC-1121"],
            confidence=89,
            observation="OAuth callback endpoints configured with wildcards are exploited to intercept user authentication codes or compromise system clients.",
            recommendation="Disable redirect_uri wildcard matches. Validate redirection targets against strict absolute paths."
        )
    ]

@app.get("/api/learning-timeline", response_model=List[LearningJourneyItem])
def get_learning_timeline():
    # Return 5 key stages in the learning journey
    return [
        LearningJourneyItem(
            interaction_id="INT-01",
            title="Initial Setup",
            description="Agent starts with baseline security rules. Relies on simple firewall blocking actions.",
            learned_fact="Standard firewalls do not prevent continuous compromise if weak credentials exist.",
            outcome_impact="High MTTR (Mean Time to Resolution) of 35 minutes.",
            step_number=1
        ),
        LearningJourneyItem(
            interaction_id="INT-05",
            title="Recognizes SSH Brute Force",
            description="Agent encounters SSH password sprayed attacks on prod-api-03 (INC-1042).",
            learned_fact="Disabling SSH password logins and enforcing SSH keypairs completely stops automated brute-force attacks.",
            outcome_impact="Resolution time drops to 11 minutes.",
            step_number=2
        ),
        LearningJourneyItem(
            interaction_id="INT-12",
            title="Learns Rotating IP Bypass",
            description="Attacker rotates source IPs during credential attack (INC-1097).",
            learned_fact="IP blocking alone fails when attackers use proxy pools. Hardened authentication (VPN + keys) is required.",
            outcome_impact="Agent stops trying simple IP bans, recommending auth-key modifications immediately.",
            step_number=3
        ),
        LearningJourneyItem(
            interaction_id="INT-20",
            title="Identifies Escalation Vectors",
            description="Credential spraying combined with privilege escalation attempt (INC-1138).",
            learned_fact="Credential sprays from rotating IPs followed by sudo activity indicate a coordinated network intrusion.",
            outcome_impact="Agent automatically recommends full host isolation and fast-track Tier-3 escalation.",
            step_number=4
        ),
        LearningJourneyItem(
            interaction_id="INT-27",
            title="Predictive Pattern Recognition",
            description="Agent tracks relationships between OAuth consented tokens, exposed wiki documentation, and token misuse.",
            learned_fact="Information exposure leaks lead directly to subsequent authentication anomalies across endpoints.",
            outcome_impact="Predicts potential system vulnerability exploits before they occur.",
            step_number=5
        )
    ]

@app.post("/api/reset")
def reset_database():
    logger.info("Reset requested: Cleaning database and resetting memories.")
    incident_service.reset_db()
    hindsight_service._seed_mock_memories()
    return {"status": "success", "message": "Database and memory store reset to initial seed state."}
