# Architecture Diagram — Incident Memory OS

```
                       ┌──────────────────────────────┐
                       │       React Frontend         │
                       │     (Vite + TS + Tailwind)   │
                       └──────────────┬───────────────┘
                                      │ HTTP REST API
                                      ▼
                       ┌──────────────────────────────┐
                       │       FastAPI Web Server     │
                       │         (Python App)         │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │   Agent Response Orchestrator│
                       └───────┬──────────────┬───────┘
                               │              │
             LLM Prompt        │              │ Semantic Query
             & Synthesis       ▼              ▼ & Storage
                       ┌──────────────┐┌──────────────┐
                       │  LLM Service ││  Hindsight   │
                       │ (Gemini/OAI/ ││ Persistent  │
                       │    Mock)     ││  Memory Bank │
                       └──────────────┘└──────────────┘
```

## System Components

### 1. Frontend: React, TypeScript, and Tailwind CSS
- **SOC Dashboard:** Displays metrics (Active, Resolved, Memory Facts, Avg resolution times), active incidents grid, and filters.
- **Incident Investigation workspace:** Live timeline renderer, Hindsight evidence container (related incidents, similarity, successful vs failed strategies), recommendations panel, human approval trigger, simulated console logs, and retention action.
- **Agent Learning Journey:** Visual progression timeline demonstrating how the agent's institutional knowledge grew.
- **Memory Graph:** Slick SVG representation of attack models, target hosts, and outcomes.
- **Interactive Demo Wizard:** Floating step-by-step panel guiding judges through the 10-step story, featuring an "Auto-Execute" button.

### 2. Backend API: FastAPI Web Server
- Maps routing endpoints for incident management, AI investigations, human approvals, and memory actions.
- Implements CORS middleware configuration for port 5173 (Vite).
- Exposes environment reset parameters to wipe mock databases for clean demo replays.

### 3. Incident Service
- Manages an in-memory dataset seeded with 25 synthetic security incidents, including the primary demo stories (INC-1042, INC-1097, INC-1138).

### 4. Hindsight Memory Service
- Connects to Hindsight via official `hindsight-client` Python SDK.
- Automatically enters **Demo Fallback Mode** if keys are missing, deploying a local mockup repository simulating semantic search scoring (e.g. matching keywords to return relevance scores).

### 5. LLM Agent Service
- Connects to Gemini (google-genai SDK), OpenAI, or Groq.
- Automatically falls back to a high-fidelity Rule Engine model if keys are missing, generating structured AIRecommendations matching the main demo stories perfectly.
