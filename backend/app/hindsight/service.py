import logging
import json
import re
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("hindsight-service")

# Try to import Hindsight from hindsight-client
HINDSIGHT_AVAILABLE = False
try:
    from hindsight_client import Hindsight
    HINDSIGHT_AVAILABLE = True
except ImportError:
    logger.warning("hindsight-client is not installed. Will use fallback mode.")

class HindsightService:
    def __init__(self):
        self.is_fallback = True
        self.client = None
        self.bank_id = settings.hindsight_bank_id

        # Local in-memory store for fallback mode
        self._mock_db: List[Dict[str, Any]] = []
        
        # Check if credentials are set
        if HINDSIGHT_AVAILABLE and settings.hindsight_api_key and settings.hindsight_api_url:
            try:
                self.client = Hindsight(
                    base_url=settings.hindsight_api_url,
                    api_key=settings.hindsight_api_key
                )
                self.is_fallback = False
                logger.info("Hindsight Client initialized successfully in LIVE mode.")
            except Exception as e:
                logger.error(f"Failed to initialize Hindsight Client in LIVE mode: {e}. Falling back.")
                self.is_fallback = True
        else:
            logger.info("Initializing Hindsight Service in DEMO FALLBACK MODE.")
            self._seed_mock_memories()

    def _seed_mock_memories(self):
        """Seed mock memories for fallback mode."""
        # We start empty, or we can seed a few general facts. 
        # The demo flow will explicitly call retain or we can seed initial history.
        # Let's seed initial facts to simulate previous operations before INC-1042.
        self._mock_db = [
            {
                "id": "mem_001",
                "content": json.dumps({
                    "incident_id": "INC-1001",
                    "type": "SSH Brute Force",
                    "system": "prod-api-03",
                    "root_cause": "SSH password-based access was active, allowing root password trials.",
                    "successful_actions": ["IP block", "Fail2ban rate-limiting"],
                    "failed_actions": [],
                    "outcome": "Contained. Key SSH setup was not active during this incident.",
                    "lessons_learned": "Enforce key-based authentication on all prod ports."
                })
            },
            {
                "id": "mem_002",
                "content": json.dumps({
                    "incident_id": "INC-1012",
                    "type": "API Abuse",
                    "system": "partner-gateway",
                    "root_cause": "Status endpoint performed complex backend health checks without cache, amplifying database load.",
                    "successful_actions": ["Add cache headers to endpoint", "Enable DDoS protection profile in Cloudflare"],
                    "failed_actions": ["IP blocking (failed - traffic came from botnet)"],
                    "outcome": "DDoS mitigated. API gateway returned to service. Status checks now cached.",
                    "lessons_learned": "Health/status check APIs must be heavily cached and isolated from database connection dependencies."
                })
            }
        ]

    def retain_memory(self, content: str) -> Dict[str, Any]:
        """Store new information in Hindsight."""
        if not self.is_fallback and self.client:
            try:
                # Sync call to retain
                res = self.client.retain(bank_id=self.bank_id, content=content)
                logger.info(f"Hindsight LIVE Retain Success: {res}")
                return {"status": "success", "mode": "live", "response": str(res)}
            except Exception as e:
                logger.error(f"Hindsight LIVE Retain Failed: {e}. Storing in mock db.")
                # fallback store
                pass
        
        # Fallback implementation
        memory_id = f"mem_{len(self._mock_db) + 1:03d}"
        self._mock_db.append({
            "id": memory_id,
            "content": content
        })
        logger.info(f"Hindsight FALLBACK Retain Success: {memory_id}")
        return {"status": "success", "mode": "fallback", "memory_id": memory_id}

    def recall_memories(self, query: str) -> List[Dict[str, Any]]:
        """Retrieve relevant memories matching query."""
        if not self.is_fallback and self.client:
            try:
                res = self.client.recall(bank_id=self.bank_id, query=query)
                logger.info(f"Hindsight LIVE Recall Success: {res}")
                # Format the response to return a list of dictionaries with content
                # usually it returns a list of memory objects
                formatted_results = []
                if hasattr(res, 'memories') or isinstance(res, list):
                    items = res.memories if hasattr(res, 'memories') else res
                    for item in items:
                        content_str = getattr(item, 'content', '') or (item.get('content') if isinstance(item, dict) else str(item))
                        score = getattr(item, 'score', 0.8) or (item.get('score', 0.8) if isinstance(item, dict) else 0.8)
                        formatted_results.append({
                            "content": content_str,
                            "score": score
                        })
                return formatted_results
            except Exception as e:
                logger.error(f"Hindsight LIVE Recall Failed: {e}. Querying mock db.")
                # fallback search
                pass

        # Fallback search - semantic simulation
        logger.info(f"Hindsight FALLBACK Recall Query: {query}")
        results = []
        
        query_words = set(re.findall(r'\w+', query.lower()))
        
        for item in self._mock_db:
            content_str = item["content"]
            # Attempt to parse json
            try:
                data = json.loads(content_str)
                # Check match criteria
                score = 0.1
                content_lower = content_str.lower()
                
                # Check for direct terms
                if "credential" in query.lower() or "ssh" in query.lower() or "brute force" in query.lower():
                    if data.get("type") in ["SSH Brute Force", "Credential Attack", "Credential Attack + Privilege Escalation"]:
                        score += 0.5
                    if "ip blocking" in content_lower:
                        score += 0.2
                    if "key-based" in content_lower:
                        score += 0.1
                
                if "privilege escalation" in query.lower() or "sudo" in query.lower():
                    if "privilege escalation" in content_lower or "root" in content_lower:
                        score += 0.4
                    if "sudo" in content_lower:
                        score += 0.3
                
                # Word match overlap
                content_words = set(re.findall(r'\w+', content_lower))
                overlap = query_words.intersection(content_words)
                score += min(0.3, len(overlap) * 0.05)
                
                # Boost specific demo matching
                if "INC-1042" in query and data.get("incident_id") == "INC-1042":
                    score = 0.95
                elif "INC-1097" in query and data.get("incident_id") == "INC-1097":
                    score = 0.95
                
                if score >= 0.3:
                    results.append({
                        "content": content_str,
                        "score": round(score, 2)
                    })
            except Exception:
                # String content search
                score = 0.2
                if any(word in content_str.lower() for word in query_words):
                    score += 0.3
                results.append({
                    "content": content_str,
                    "score": score
                })
        
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:5]

    def reflect_on_memories(self, query: str) -> str:
        """Ask Hindsight to reflect and synthesize lessons across memories."""
        if not self.is_fallback and self.client:
            try:
                res = self.client.reflect(bank_id=self.bank_id, query=query)
                logger.info(f"Hindsight LIVE Reflect Success: {res}")
                return str(res)
            except Exception as e:
                logger.error(f"Hindsight LIVE Reflect Failed: {e}. Querying mock reflection.")
                pass
        
        # Fallback reflection logic
        logger.info(f"Hindsight FALLBACK Reflect Query: {query}")
        memories = self.recall_memories(query)
        if not memories:
            return "No prior relevant incidents found in historical memory."
        
        # Parse and synthesize
        recalled_incidents = []
        successful_remediations = []
        failed_remediations = []
        
        for mem in memories:
            try:
                data = json.loads(mem["content"])
                inc_id = data.get("incident_id", "Unknown")
                recalled_incidents.append(f"{inc_id} ({data.get('type')})")
                
                for act in data.get("successful_actions", []):
                    successful_remediations.append(f"{act} (from {inc_id})")
                for act in data.get("failed_actions", []):
                    failed_remediations.append(f"{act} (from {inc_id})")
            except Exception:
                pass
        
        reflection = f"Reflecting on {len(recalled_incidents)} historical memory records: {', '.join(recalled_incidents)}.\n\n"
        if successful_remediations:
            reflection += "Workable historical remediations include:\n- " + "\n- ".join(set(successful_remediations)) + "\n\n"
        if failed_remediations:
            reflection += "Failed historical attempts include:\n- " + "\n- ".join(set(failed_remediations)) + "\n\n"
        
        reflection += "Summary: Organizations experience repeating patterns of authentication and access abuse. A simple IP-blocking strategy has repeatedly failed due to threat actors rotating source IPs. Hardening access controls (disabling password authentication, enforcing key-based login, and implementing rate limiting) is the only long-term containment path."
        
        return reflection

hindsight_service = HindsightService()
