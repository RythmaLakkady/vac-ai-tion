# VAC-AI-TION Production Roadmap

## P0 — Critical
- [x] **Security: Remove Client-Side Secrets**: Move Groq and LocationIQ API keys to backend environment variables. Do not send API keys in JSON payloads. *(Completed in Phase 2)*
- [x] **Security: Remove Hardcoded Firebase Key**: Remove fallback API key in `firebase.jsx`. *(Completed in Phase 2)*
- [x] **Security: Firestore Rules**: Secure `UserTrips` to only allow the owner to read/write, unless shared via a secure public link. *(Completed in Phase 2)*
- [x] **Reliability: Cloud Function Architecture**: Migrate the remote/external cloud function into this repository's `functions/` folder to ensure code parity and deployment safety. *(Completed in Phase 2)*

## P1 — Production Quality
- [x] **Observability: Analytics Tracking**: Implement basic privacy-conscious analytics for product events (trip_generated, signup, etc). *(Completed in Phase 3)*
- [x] **Reliability: Error Boundaries**: Implement React Error Boundaries to prevent full app crashes. *(Completed in Phase 3)*
- [x] **Reliability: API Error Handling**: Replace generic toasts with actionable, user-friendly error states (e.g., offline mode, rate limits). *(Completed in Phase 3)*
- [x] **Architecture: Component Refactor**: Break down `src/createTrip/index.jsx` (700+ lines) into smaller, manageable components. *(Completed in Phase 3)*
- [x] **Performance: Routing & Lazy Loading**: Add `React.lazy` for routes to improve initial load time. *(Completed in Phase 3)*
- [x] **Testing: Setup Test Suite**: Configure Vitest for unit tests, regression tests, and end-to-end journey tests. *(Completed in Phase 3 & Phase 9)*

## P2 — Product Enhancement
- [x] **UX: Visual Trip Roadmap**: Implement a timeline/roadmap view for the generated itineraries in `/view-trip`. *(Completed in Phase 4)*
- [x] **UX: Editable Itinerary**: Add drag-and-drop to reorder activities and allow regeneration of single days. *(Completed in Phase 4)*
- [x] **UX: Map Integration**: Integrate Leaflet / OpenStreetMap to visualize the route alongside the itinerary. *(Completed in Phase 4)*
- [x] **UX: Travel Alternatives**: Allow users to click an activity and "Show Cheaper/Closer/Luxury" alternatives. *(Completed in Phase 5)*
- [x] **Feature: Destination Guides**: Add a section for destination overviews, weather, culture, and local food. *(Completed in Phase 5)*

## P3 — Delight / Advanced Features
- [x] **Feature: Price Comparison Engine**: Add a dashboard for estimated costs for flights, hotels, and activities. *(Completed in Phase 5)*
- [x] **Feature: Budget Planner**: Interactive budget dashboard comparing expected vs actual costs. *(Completed in Phase 5)*
- [x] **Feature: Public Sharing**: Generate unique, secure `/v/{id}` links for sharing trips with a beautiful preview. *(Completed in Phase 6)*
- [x] **UX: Microinteractions**: Add hover effects, transition animations, and improved loading states without sacrificing performance. *(Completed in Phase 7)*
- [x] **Intelligence: Feasibility Score**: Show a metric indicating if the trip pace is too fast or budget is unrealistic. *(Completed in Phase 7)*
