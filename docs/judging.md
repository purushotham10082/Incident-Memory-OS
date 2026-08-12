# Judging Criteria Alignment — Incident Memory OS

This document maps the features of **Incident Memory OS** to the hackathon's judging criteria:

---

## 1. Innovation (30%)
- **Persistent Institutional Memory:** Rather than operating as a stateless chatbot or relying on simple context windows, the agent possesses persistent memory across interactions.
- **Synthesized Learning:** The agent does not just retrieve documents; it distinguishes what actions succeeded, what failed, and *why* they failed based on prior experiences.

---

## 2. Hindsight Memory (25%)
- **Full Lifecycle Integration:**
  - **Retain:** Structured incident resolution blocks are converted to JSON and stored in Hindsight memory banks.
  - **Recall:** Similar past incidents are retrieved dynamically using semantic queries.
  - **Reflect:** Agent synthesizes recalled context to compare outcomes and extract workable strategies.
- **Visible Memory Evolution:** The UI displays similarity scores, recalled incident references, root cause insights, and vertical timeline learning progressions.

---

## 3. Technical Implementation (20%)
- **Framework Stack:** React (TypeScript, Tailwind CSS) for frontend; Python FastAPI for backend.
- **Robust Fallback Engine:** Features a dual-mode integration. If Hindsight API credentials are not provided, it deploys a local mock search repository, ensuring a bulletproof demo experience during pitching.
- **Agent Orchestrator:** Uses structured prompts and reasoning chains to process security data.

---

## 4. User Experience (15%)
- **Premium SOC UI:** Features a dark security operations theme, severity color codes, a live timeline investigation tracker, and metric status panels.
- **Interactive Knowledge Map:** Utilizes an interactive SVG relation graph showing nodes of attacks, target hosts, resolutions, and outcomes.
- **Interactive Demo Wizard:** Floating controller with an "Auto-Execute" button to step judges through the story in 60 seconds.

---

## 5. Real-World Impact (10%)
- **Reduced MTTR:** By referencing prior resolutions, the agent guides human operators to bypass ineffective steps (like IP blocking) to contain issues faster.
- **Preserved Analyst Knowledge:** Important findings from Tier-3 analysts are immediately encoded into memory, making junior analysts more effective.
