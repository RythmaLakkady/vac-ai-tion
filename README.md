# vac-ai-tion

Full-stack travel planning platform that generates structured, validated multi-day itineraries through an asynchronous background orchestration pipeline.

[![CI](https://github.com/RythmaLakkady/vac-ai-tion/actions/workflows/ci.yml/badge.svg)](https://github.com/RythmaLakkady/vac-ai-tion/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<!-- SCREENSHOT / DEMO GIF PLACEHOLDER -->
> Screenshot placeholder: Capture a desktop view of an opened itinerary (e.g. Kyoto) showing the daily timeline cards, interactive Leaflet route map, and daily budget summary. Save the image to `docs/images/app-screenshot.png` and replace this placeholder with:
> `![vac-ai-tion Itinerary View](docs/images/app-screenshot.png)`

[Live Demo](https://vac-ai-tion.vercel.app) | [Source Code](https://github.com/RythmaLakkady/vac-ai-tion)

---

## The Problem

Travel planning forces travelers to switch between disjointed tools: conversational LLMs that lack routing constraints, static booking sites that ignore daily schedules, and map tools without budget logic. Single-turn LLM generation frequently returns missing days, coordinate errors, or invalid JSON. vac-ai-tion treats trip generation as an asynchronous background workflow that validates schema structure, day limits, and budget constraints before persisting the itinerary.

---

## Key Features

- Multi-stage background generation: Travelers configure destination, party size, budget, and travel style, then watch step-by-step progress streamed live via Cloud Firestore rather than waiting on a blocking browser request.
- Bounded validation loop: An automated Critic agent evaluates day counts (1 to 15 days), budget ceilings, and final-day departure routing, retrying revision prompts up to 3 times before saving.
- Deterministic request caching: Hashes normalized trip inputs with SHA-256 to serve repeat queries from Firestore instantly, reducing latency and avoiding redundant LLM inference costs.
- Interactive drag-and-drop itinerary editing: Travelers reorder activities within or across days using accessible drag-and-drop, with automatic recalculation of daily budgets, route timings, and map polylines.
- Location autocomplete with fallback cascade: Travelers search destinations with real-time LocationIQ autocomplete, which automatically cascades to OpenStreetMap Nominatim if the primary geocoder is unavailable.
- Sanitized public trip sharing: Travelers can share a read-only itinerary link (`/v/:tripId`) that strips private personal profile notes and health info before display.

---

## Tech Stack

### Frontend
- React 18: Component-based UI rendering with client-side routing via React Router DOM 7.
- Vite 6: Development server and production bundler with Rollup chunking.
- Tailwind CSS: Utility-first styling with PostCSS compilation.
- @hello-pangea/dnd: Maintained, accessible drag-and-drop activity reordering without DOM layout thrashing.
- Leaflet and React-Leaflet: Interactive map rendering and coordinate plotting without third-party vendor lock-in.
- Framer Motion: Coordinated status transitions during generation and chapter expansion.

### Backend
- Node.js and Express: REST API runtime handling geocoding proxying, price comparison aggregation, and job creation.
- Firebase Cloud Functions v2: Serverless invocation endpoints for asynchronous agent workflows.
- Groq SDK: High-throughput Llama 3.3 70B inference engine for fast structured JSON generation.

### Data and Authentication
- Firebase Authentication: Session management supporting Email/Password and Google OAuth.
- Cloud Firestore: Document database storing user itineraries, user profiles, and real-time agent execution logs (`agentJobs`).

### Infrastructure and Tooling
- LocationIQ API: Geocoding and destination autocomplete service with OpenStreetMap Nominatim fallback.
- Vitest and React Testing Library: Unit and integration test runner executing with JSDOM.
- ESLint 9: Flat-configuration linter for static code analysis.
- GitHub Actions: Continuous integration pipeline running lint, test, and build checks on pull requests and pushes to `main`.
- Vercel: Edge hosting for the React single-page application.
- Render: Cloud hosting for the Node.js / Express API service.

---

## Architecture

The system decouples client interactions from inference execution through a job queue pattern.

```mermaid
flowchart TD
    User["Traveler (Browser)"] -->|1. Submit parameters| Client["React 18 SPA"]
    Client -->|2. POST /create-job| API["Express API / Cloud Function"]
    
    API -->|3. Compute SHA-256| CacheCheck{"Cache Hit?"}
    CacheCheck -- Yes -->|Return existing itinerary| Client
    CacheCheck -- No -->|4. Create Job Record| Firestore["Cloud Firestore (agentJobs)"]
    
    API -->|5. HTTP 202 Accepted| Client
    Client -->|6. onSnapshot listener| Firestore
    
    Firestore -->|7. Background trigger| Orchestrator["Agent Orchestrator"]
    Orchestrator -->|8. Generate itinerary| LLM["Groq Llama 3.3 70B"]
    LLM -->|9. Verify constraints| Critic{"Critic Passed?"}
    Critic -- No (max 3)| LLM
    Critic -- Yes -->|10. Persist Trip| Trips["Cloud Firestore (UserTrips)"]
    Trips -->|11. Real-time update| Client
```

---

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- A Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RythmaLakkady/vac-ai-tion.git
   cd vac-ai-tion
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the project root:
   ```env
   # API Keys
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_OPENAI_API_KEY=your_openai_api_key_for_chat
   VITE__LOCATION_IQ_API_KEY=your_locationiq_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key

   # Backend API Service URL
   VITE_FUNCTION_URL=https://vac-ai-tion.onrender.com
   VITE_PRICE_FUNCTION_URL=https://vac-ai-tion.onrender.com

   # Set to true only if running local Firebase Functions emulator on port 5001
   VITE_USE_LOCAL_EMULATOR=false
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173/`.

---

## Verification and Testing

All code changes must pass the test suite, linting rules, and production build checks before merging:

```bash
# Run ESLint across all files
npm run lint

# Run all 40 automated tests via Vitest
npm test -- --run

# Build production assets and verify PostCSS compilation
npm run build
```

---

## Engineering Highlights

- Testing approach: 40 automated tests across 9 suites in Vitest. Coverage includes end-to-end user journeys (`tests/e2e-user-journey.test.jsx`), React hook ordering regression tests (`tests/hooks-regression.test.jsx`), feasibility calculation checks (`src/service/__tests__/feasibilityEngine.test.js`), and privacy sanitization tests (`src/__tests__/remediation.test.jsx`).
- Reliability and fallback design: The destination service implements a cascading fallback from LocationIQ to OpenStreetMap Nominatim. If an external geocoding provider fails, the search input falls back gracefully to custom freeform location entry rather than breaking the form.
- Environment URL resolver: `resolveFunctionUrl` in `src/service/config.js` validates hostnames and environment variables to route requests to the deployed backend during development, preventing unhandled connection exceptions when local emulators are offline.
- Data privacy guardrails: Public itinerary sharing via `/v/:tripId` explicitly sanitizes user health details, notes, and profile identifiers before saving to prevent unintended data exposure.
- Continuous integration: GitHub Actions runs on every push and pull request to `main`, validating that linting passes with zero errors, all tests pass, and the Vite production bundle builds successfully.

---

## Challenges and Decisions

### Challenge 1: Single-Turn LLM Generation Failures
- Problem: Prompting an LLM in a single turn to generate a complete 7-day schedule frequently resulted in malformed JSON, missing latitude/longitude coordinates, or trips exceeding the requested budget.
- Solution: Structured the generation as a Planner-Critic loop in `functions/src/agentOrchestrator.js`. The Planner generates candidate itineraries, while the Critic validates budget thresholds, day limits, and schema completeness. If validation fails, the Critic feeds structured failure reasons back to the Planner for revision up to 3 cycles.

### Challenge 2: Long-Running Request Timeouts
- Problem: Generating 5 to 15 days of structured travel plans with coordinates takes 10 to 25 seconds of inference time. Synchronous HTTP requests timed out on client connections and created poor user experiences.
- Solution: Decoupled submission from generation. The backend writes a pending record to `agentJobs` in Firestore and returns an HTTP 202 Accepted with a `jobId`. The frontend attaches a Firestore `onSnapshot` listener to the document, streaming step-by-step progress updates to the UI in real time.

### Challenge 3: Local Development vs. Production Service Routing
- Problem: Hardcoding localhost URLs in client code caused `TypeError: Failed to fetch` errors whenever the app was opened on `localhost:5173` without local Firebase emulators running on port 5001.
- Solution: Replaced binary `isLocal` toggles with an environment resolver (`resolveFunctionUrl`) in `src/service/config.js`. The resolver prioritizes explicit environment variables, falls back to the production Render cloud backend, and only targets local emulators when `VITE_USE_LOCAL_EMULATOR=true` is set.

---

## Known Limitations and Roadmap

- Pricing data: Flight, hotel, and ticket pricing endpoints currently return heuristic mock vendor estimates (`functions/src/index.js`), not live GDS (Amadeus/Sabre) booking feeds. Integration with live booking APIs is planned for future milestones.
- Cache key parameter coverage: Cache hashing includes destination, duration, budget, and travelers, but omits travel style and health preferences (`functions/src/cacheUtils.js`).
- Single-user editing: While itineraries can be shared via public read-only URLs, concurrent multi-user editing with conflict resolution is not yet implemented.
- Offline support: The application currently requires an active network connection for map tiles and trip retrieval. Adding Service Worker caching and IndexedDB offline persistence is slated for future releases.

---

## Author

**Rythma Lakkady**  
Full-Stack Engineer  
- GitHub: [https://github.com/RythmaLakkady](https://github.com/RythmaLakkady)  
- Email: [rythma.pramod@gmail.com](mailto:rythma.pramod@gmail.com)  
- LinkedIn: [Add LinkedIn Profile URL]  
- Portfolio: [Add Portfolio URL]  

---

## License

This project is licensed under the [MIT License](LICENSE).
