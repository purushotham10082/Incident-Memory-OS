import logging
import json
from typing import List, Dict, Any, Optional
from app.config import settings
from app.models.schemas import AIRecommendation, MemoryCard

logger = logging.getLogger("llm-service")

class LLMService:
    def __init__(self):
        self.provider = settings.llm_provider.lower()
        self.model = settings.llm_model
        self.api_key = settings.llm_api_key
        logger.info(f"LLM Service initialized with provider: {self.provider}")

    def generate_investigation(
        self, 
        incident_id: str, 
        incident_details: Dict[str, Any], 
        recalled_memories: List[Dict[str, Any]], 
        reflection: str
    ) -> AIRecommendation:
        """
        Runs the agentic reasoning loop. It combines the current incident context,
        recalled memories from Hindsight, and reflection to produce a structured recommendation.
        """
        # If provider is mock, or keys are missing, return high-fidelity mock responses
        if self.provider == "mock" or not self.api_key:
            return self._generate_mock_investigation(incident_id, incident_details, recalled_memories, reflection)
        
        # Real LLM integration (OpenAI or Google GenAI)
        try:
            if self.provider == "openai":
                return self._call_openai(incident_id, incident_details, recalled_memories, reflection)
            elif self.provider in ["google", "gemini"]:
                return self._call_google(incident_id, incident_details, recalled_memories, reflection)
            else:
                logger.warning(f"Unsupported provider {self.provider}. Falling back to high-fidelity mocks.")
                return self._generate_mock_investigation(incident_id, incident_details, recalled_memories, reflection)
        except Exception as e:
            logger.error(f"Error calling LLM provider {self.provider}: {e}. Falling back to mocks.")
            return self._generate_mock_investigation(incident_id, incident_details, recalled_memories, reflection)

    def _call_openai(
        self, 
        incident_id: str, 
        incident_details: Dict[str, Any], 
        recalled_memories: List[Dict[str, Any]], 
        reflection: str
    ) -> AIRecommendation:
        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        
        system_prompt = self._get_system_prompt()
        user_prompt = self._get_user_prompt(incident_details, recalled_memories, reflection)
        
        # We request structured output or json
        response = client.chat.completions.create(
            model=self.model or "gpt-4-turbo",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2
        )
        
        res_text = response.choices[0].message.content
        return self._parse_llm_json(res_text, incident_id)

    def _call_google(
        self, 
        incident_id: str, 
        incident_details: Dict[str, Any], 
        recalled_memories: List[Dict[str, Any]], 
        reflection: str
    ) -> AIRecommendation:
        # Utilizing google-genai SDK
        from google import genai
        client = genai.Client(api_key=self.api_key)
        
        system_prompt = self._get_system_prompt()
        user_prompt = self._get_user_prompt(incident_details, recalled_memories, reflection)
        
        response = client.models.generate_content(
            model=self.model or "gemini-2.5-flash",
            contents=user_prompt,
            config={
                "system_instruction": system_prompt,
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        )
        
        res_text = response.text
        return self._parse_llm_json(res_text, incident_id)

    def _get_system_prompt(self) -> str:
        return """You are an enterprise security incident response analyst operating in a simulated SOC environment.
Your job is to investigate incidents using both the current incident and organizational historical memory.

Never pretend historical information exists if it was not retrieved.
When relevant memories are available:
* identify them
* explain their relevance
* distinguish successful and failed previous approaches
* consider temporal context
* identify recurring patterns
* recommend actions based on evidence

Do not execute real-world security actions. All remediation is simulated and requires human approval.
The objective is not merely to provide generic cybersecurity advice. The objective is to apply organizational experience to improve incident response.

CRITICAL RULE: Never say "I remember..." unless that memory was actually retrieved from Hindsight. Instead say "Historical memory shows..." or "I found X related incidents...".

Return your investigation ONLY as a JSON object with the following fields:
{
  "findings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "confidence": 90, (integer between 0 and 100)
  "historical_evidence_count": 2, (integer)
  "previous_successful_strategy": "Summary of previous successful remediation",
  "reasoning": "Detailed analyst reasoning paragraph detailing how historical memory influenced this recommendation"
}
"""

    def _get_user_prompt(self, incident_details: Dict[str, Any], recalled_memories: List[Dict[str, Any]], reflection: str) -> str:
        return f"""CURRENT INCIDENT Details:
{json.dumps(incident_details, indent=2)}

RECALLED HISTORICAL MEMORIES from Hindsight:
{json.dumps(recalled_memories, indent=2)}

REFLECTION SUMMARY:
{reflection}

Analyze this incident and generate the requested JSON response. Remember to use recalled memories to guide your suggestions and mention them explicitly in the 'reasoning' block without using first-person memory statements (e.g. 'I remember').
"""

    def _parse_llm_json(self, res_text: str, incident_id: str) -> AIRecommendation:
        data = json.loads(res_text)
        return AIRecommendation(
            recommendation_id=f"REC-{incident_id[4:]}",
            incident_id=incident_id,
            findings=data.get("findings", []),
            recommendations=data.get("recommendations", []),
            confidence=data.get("confidence", 85),
            historical_evidence_count=data.get("historical_evidence_count", 0),
            previous_successful_strategy=data.get("previous_successful_strategy", "N/A"),
            reasoning=data.get("reasoning", "")
        )

    def _generate_mock_investigation(
        self, 
        incident_id: str, 
        incident_details: Dict[str, Any], 
        recalled_memories: List[Dict[str, Any]], 
        reflection: str
    ) -> AIRecommendation:
        """Generates high-fidelity mock investigations tailored to the demo story."""
        rec_id = f"REC-{incident_id[4:]}"
        
        # Scenario 1: INC-1042
        if incident_id == "INC-1042":
            # No prior memories of this type usually retrieved yet
            evidence_count = len(recalled_memories)
            reasoning = "Historical memory contains no previous SSH brute-force incidents matching this signature on 'prod-api-03' in the current database. Standard network security hygiene dictates responding by blocking the single source IP (198.51.100.42) and restricting SSH configurations."
            if evidence_count > 0:
                reasoning = f"Historical memory shows {evidence_count} related records. Standard protocol dictates blocking the attack vector."
                
            return AIRecommendation(
                recommendation_id=rec_id,
                incident_id=incident_id,
                findings=[
                    "High frequency of SSH connection attempts on prod-api-03.",
                    "Attempts originate from a single IP address (198.51.100.42).",
                    "Password authentication is currently enabled on target host."
                ],
                recommendations=[
                    "Block malicious source IP 198.51.100.42 via security group rules.",
                    "Disable password-based SSH authentication.",
                    "Enable SSH key-based authentication only.",
                    "Install and enable rate limiting (Fail2ban) on port 22."
                ],
                confidence=85,
                historical_evidence_count=evidence_count,
                previous_successful_strategy="None matching. Standard host hardening recommended.",
                reasoning=reasoning
            )
            
        # Scenario 2: INC-1097
        elif incident_id == "INC-1097":
            # Must recall INC-1042
            has_1042 = any("INC-1042" in str(m) for m in recalled_memories)
            
            findings = [
                "Credential spraying attempts against database logins on prod-db-02.",
                "Attacker is rotating source IPs to bypass simple IP firewalls."
            ]
            
            if has_1042:
                findings.append("This incident resembles a previous credential attack (INC-1042).")
                reasoning = (
                    "Historical memory shows that during INC-1042, the attacker targeted SSH services. "
                    "A critical learning was that IP blocking alone was insufficient because the attacker rotates source IP addresses. "
                    "Based on this lesson, I recommend implementing key-based authentication tunnel and rate limiting. "
                    "This historically contained the threat in 11 minutes and prevented further credentials spraying."
                )
                success_strat = "Key-based authentication + Rate limiting (established in INC-1042)"
            else:
                reasoning = "Historical memory contains credential attacks. Enforcing authentication hardening (VPN + Bastion keys) is the recommended action."
                success_strat = "Enforce key-based VPN bastion tunnels"
                
            return AIRecommendation(
                recommendation_id=rec_id,
                incident_id=incident_id,
                findings=findings,
                recommendations=[
                    "Do not rely on IP blocking alone (attacker is using rotating proxies).",
                    "Enforce database connections via secure key-based VPN bastion tunnel.",
                    "Disable public-facing database endpoints.",
                    "Implement login attempt rate limiting on database service."
                ],
                confidence=92,
                historical_evidence_count=1 if has_1042 else 0,
                previous_successful_strategy=success_strat,
                reasoning=reasoning
            )

        # Scenario 3: INC-1138 (The WOW Demo)
        elif incident_id == "INC-1138":
            # Recalls multiple incidents (1042, 1097, etc.)
            findings = [
                "Credential spraying attempts from rotating IP addresses on production-api.",
                "Successful authentication attempt observed from suspicious external IP.",
                "Subsequent privilege escalation (sudo access) and backdoor account creation detected."
            ]
            
            reasoning = (
                "Historical evidence indicates this may not be an isolated credential attack. "
                "Similar credential spray behaviors appeared across multiple incidents (INC-1042 and INC-1097). "
                "However, this incident has escalated to include privilege escalation. "
                "Because rotating IPs and credential spraying are combined with a successful root exploit, "
                "I recommend escalating this incident as a potential coordinated intrusion and isolating production-api immediately."
            )
            
            return AIRecommendation(
                recommendation_id=rec_id,
                incident_id=incident_id,
                findings=findings,
                recommendations=[
                    "Isolate target host 'production-api' from the network immediately.",
                    "Do not rely on IP blocking alone due to proxy rotating behavior.",
                    "Revert sudoers files modifications and revoke newly created service accounts.",
                    "Apply host kernel security patching to prevent privilege escalation.",
                    "Escalate this incident immediately to the Tier-3 incident response team."
                ],
                confidence=95,
                historical_evidence_count=2,
                previous_successful_strategy="Isolate host + Enforce key-based access + Kernel patching",
                reasoning=reasoning
            )

        # Generic Case
        return AIRecommendation(
            recommendation_id=rec_id,
            incident_id=incident_id,
            findings=[
                f"Anomaly detected on system {incident_details.get('system')}.",
                f"Indicators point to: {', '.join(incident_details.get('indicators', []))}."
            ],
            recommendations=[
                "Isolate system and inspect logs.",
                "Review security policy compliance."
            ],
            confidence=80,
            historical_evidence_count=len(recalled_memories),
            previous_successful_strategy="Incident isolation",
            reasoning="Investigation based on standard incident templates. System anomalies checked against basic firewall logs."
        )

llm_service = LLMService()
