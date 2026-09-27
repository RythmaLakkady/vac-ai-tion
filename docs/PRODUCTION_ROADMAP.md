# VAC-AI-TION Production Roadmap

## P0 — Critical
- [ ] **Security: Remove Client-Side Secrets**: Move Groq and LocationIQ API keys to backend environment variables. Do not send API keys in JSON payloads.
- [ ] **Security: Remove Hardcoded Firebase Key**: Remove fallback API key in `firebase.jsx`.
- [ ] **Security: Firestore Rules**: Secure `UserTrips` to only allow the owner to read/write, unless shared via a secure public link.
- [ ] **Reliability: Cloud Function Architecture**: Migrate the remote/external cloud function into this repository's `functions/` folder to ensure code parity and deployment safety.

## P1 — Production Quality
- [ ] **Observability: Analytics Tracking**: Implement basic privacy-conscious analytics for product events (trip_generated, signup, etc).
- [ ] **Reliability: Error Boundaries**: Implement React Error Boundaries to prevent full app crashes.
- [ ] **Reliability: API Error Handling**: Replace generic toasts with actionable, user-friendly error states (e.g., offline mode, rate limits).
- [ ] **Architecture: Component Refactor**: Break down `src/createTrip/index.jsx` (700+ lines) into smaller, manageable components.
- [ ] **Performance: Routing & Lazy Loading**: Add `React.lazy` for routes to improve initial load time.
- [ ] **Testing: Setup Test Suite**: Configure Vitest for unit tests and Playwright for E2E tests.

## P2 — Product Enhancement
- [ ] **UX: Visual Trip Roadmap**: Implement a timeline/roadmap view for the generated itineraries in `/view-trip`.
- [ ] **UX: Editable Itinerary**: Add drag-and-drop to reorder activities and allow regeneration of single days.
- [ ] **UX: Map Integration**: Integrate Google Maps or Mapbox to visualize the route alongside the itinerary.
- [ ] **UX: Travel Alternatives**: Allow users to click an activity and "Show Cheaper/Closer/Luxury" alternatives.
- [ ] **Feature: Destination Guides**: Add a section for destination overviews, weather, culture, and local food.

## P3 — Delight / Advanced Features
- [ ] **Feature: Price Comparison Engine**: Add a dashboard for estimated costs for flights, hotels, and activities.
- [ ] **Feature: Budget Planner**: Interactive budget dashboard comparing expected vs actual costs.
- [ ] **Feature: Public Sharing**: Generate unique, secure `/v/{id}` links for sharing trips with a beautiful preview.
- [ ] **UX: Microinteractions**: Add hover effects, transition animations, and improved loading states without sacrificing performance.
- [ ] **Intelligence: Feasibility Score**: Show a metric indicating if the trip pace is too fast or budget is unrealistic.
