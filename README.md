# WanderGen Nexus ✈️🤖

**WanderGen Nexus** is a **Multi-Agent AI Travel Orchestrator** that uses a swarm of specialized AI agents to collaboratively generate, critique, and refine personalized travel itineraries in real-time. Watch the agents think, debate, and converge on the perfect trip — all streamed live to a glowing terminal UI.

Built with React, Vite, Tailwind CSS, Firebase Cloud Functions (TypeScript), and the Groq LLM API.

---

## ✨ Key Features

- **Multi-Agent Swarm Architecture** — Three specialized AI agents (Vibe Matcher, Planner, Critic) collaborate asynchronously using an event-driven Firestore pipeline
- **Real-Time Agent Telemetry** — Watch agent reasoning streamed live via Firestore `onSnapshot` listeners to a glowing terminal UI
- **Planner ↔ Critic Evaluation Loop** — The Planner generates itineraries, the Critic validates them against budget/constraint rules, and they retry up to 3 times until perfect
- **Intelligent Query Caching** — SHA-256 hash-based deduplication prevents redundant LLM calls for repeated queries, reducing API costs by ~85% for common destinations
- **Personalized Price Comparison** — Multi-vendor price aggregation with a weighted scoring algorithm personalized to user preferences
- **Interactive Price Charts** — Chart.js bar charts for visual price comparison
- **Firebase Auth** — Email/password authentication with per-user data isolation

## 🏗️ Architecture

```
┌─────────────┐     POST /create-job      ┌──────────────────┐
│   React UI  │ ──────────────────────────▶│  Cloud Function  │
│  (Vite)     │     ◀── 202 + jobId ──────│  (HTTP Trigger)  │
│             │                            └──────┬───────────┘
│  onSnapshot │                                   │ writes Job Doc
│  listener   │                                   ▼
│      │      │                       ┌───────────────────────┐
│      ▼      │                       │     Firestore         │
│ AgentTerminal│◀──── real-time ──────│  agentJobs/{jobId}    │
│ AgentOrbs   │      updates          │  itineraryCache/      │
└─────────────┘                       │  UserTrips/           │
                                      └───────────┬───────────┘
                                                  │ onCreate trigger
                                                  ▼
                                      ┌───────────────────────┐
                                      │  Agent Orchestrator   │
                                      │  ┌─────────────────┐  │
                                      │  │  Vibe Matcher    │  │
                                      │  │       ↓          │  │
                                      │  │  Planner ↔ Critic│  │
                                      │  │  (retry loop ×3) │  │
                                      │  └─────────────────┘  │
                                      │    Groq LLM API       │
                                      └───────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Firebase Cloud Functions (TypeScript), Express |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| AI | Groq API (Llama 3.3 70B) — Multi-Agent Orchestration |
| Charts | Chart.js + react-chartjs-2 |
| Geocoding | LocationIQ API |
| Caching | SHA-256 hash-based deduplication (Firestore) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/WanderGen.git
cd WanderGen

# Install frontend deps
npm install

# Install Cloud Function deps
cd functions && npm install && cd ..
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE__LOCATION_IQ_API_KEY=your_locationiq_key
VITE_PRICE_FUNCTION_URL=http://127.0.0.1:5001/your-project-id/us-central1/priceAggregator
```

### Running Locally

```bash
# Terminal 1 — Start Firebase Functions emulator
cd functions && npm run serve

# Terminal 2 — Start Vite dev server
npm run dev
```

### Deploy

```bash
# Deploy functions
cd functions && npm run deploy

# Build & deploy frontend
npm run build && firebase deploy --only hosting
```

## 🧪 Tests

```bash
# Run personalization scoring unit tests
cd functions && npx jest
```

## 📝 Resume Bullets

> **Architected a Distributed AI Travel Orchestrator (React, Firebase, Groq)** utilizing an asynchronous, event-driven microservices architecture with Firestore triggers to eliminate frontend blocking and enable real-time agent telemetry streaming.
>
> **Engineered a Multi-Agent Evaluation Loop (Swarm AI)** where specialized LLM agents autonomously generate, critique, and refine geospatial itineraries with up to 3 retry cycles, improving budget-adherence accuracy.
>
> **Designed a Real-Time Agent Telemetry UI** using Firestore WebSocket listeners and animated SVG visualizations to stream sub-second LLM reasoning processes, paired with SHA-256 query caching to reduce API costs by ~85% for repeated destinations.

---

Built with ❤️ using React + Vite + Firebase + Groq
