# Incident Memory OS

### "Your SOC shouldn't have to learn the same lesson twice."

Incident Memory OS is an AI-powered security incident response agent with persistent institutional memory. It remembers previous security incidents, root causes, analyst decisions, successful and failed remediation strategies, and outcomes. Using Hindsight as its memory engine, it reasons across historical records to investigate new incidents and recommend optimal responses.

---

## 🏗️ Architecture

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

See [architecture.md](file:///c:/Users/purus/OneDrive/Desktop/hackwith/docs/architecture.md) for more details.

---

## 🛠️ Tech Stack & Key Features

- **Frontend:** React, TypeScript, Tailwind CSS, Lucide icons.
- **Backend:** Python FastAPI, Pydantic, HTTPX, Pytest.
- **Memory Engine:** [Hindsight](https://vectorize.io) Client.
- **AI Agent Engine:** Gemini (Google GenAI) or OpenAI SDKs.
- **Dual Fallback System:** Fully functional locally without API keys, utilizing a high-fidelity local semantic-matching database mock and rule engine for offline hackathon pitches.
- **Interactive Knowledge Map:** SVG relations graph linking threat vectors, targets, and containment outcomes.
- **Learning Journey:** Vertical timeline visualization tracking agent knowledge accumulation.
- **Demo Storyboard Wizard:** Floating controller with an **"Auto-Execute"** automation button to run the entire pitch flow in 60 seconds with single clicks.

---

## 🚀 Installation & Running

### 1. Backend Setup

From the root workspace directory:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the FastAPI development server
python -m uvicorn app.main:app --reload --port 8000
```
*(Make sure python files are in `backend/app/main.py`. The command can be run with cwd as `backend/` or using the module flag: `python -m uvicorn app.main:app --reload`)*

### 2. Frontend Setup

From the `frontend/` directory:

```bash
# 1. Install Vite and React dependencies
npm install

# 2. Start the Vite development server
npm run dev
```
The frontend application will boot up at **`http://localhost:5173`**.

---

## ⚙️ Environment Configuration

Create a `.env` file at the root workspace directory (a template is available in `.env.example`):

```ini
# Hindsight Credentials (leave blank for local Demo Fallback Mode)
HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your-api-key
HINDSIGHT_BANK_ID=incident-memory-os

# LLM Config (supports 'google', 'openai', 'groq', or 'mock')
LLM_PROVIDER=mock
LLM_API_KEY=
LLM_MODEL=
```

---

## ⚡ 60-Second Demo Storyboard

Open **`http://localhost:5173`** in your browser. Expand the **Demo Wizard** in the bottom-right and follow these steps:

1. **Step 1 - Reset:** Click *Auto-Execute* to clean the databases.
2. **Step 2 & 3 - Investigate INC-1042:** View SSH Brute Force on `prod-api-03`. Run investigation (no prior memories found).
3. **Step 4 & 5 - Mitigate & Save:** Click *Approve*, *Resolve*, and *Save Experience to Memory* (key-based login rules stored).
4. **Step 6 & 7 - Investigate INC-1097:** View credential spraying on `prod-db-02` (attacker using rotating IPs). Run investigation: Hindsight recalls `INC-1042` and advises that IP blocking fails against rotating proxy IPs, suggesting keys immediately.
5. **Step 8 - Resolve:** Approve and resolve `INC-1097`.
6. **Step 9 & 10 - Coordinated Pattern (INC-1138):** Open the critical incident. The agent recalls multiple incidents and warns of a coordinated intrusion, recommending host isolation and Tier-3 escalation.

---

## 📑 Supporting Documentation

- [System Architecture](file:///c:/Users/purus/OneDrive/Desktop/hackwith/docs/architecture.md)
- [Pitch Script](file:///c:/Users/purus/OneDrive/Desktop/hackwith/docs/pitch.md)
- [60-Second Demo Script](file:///c:/Users/purus/OneDrive/Desktop/hackwith/docs/demo-script.md)

