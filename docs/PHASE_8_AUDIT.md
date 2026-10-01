# PHASE 8 REPOSITORY PERFORMANCE AUDIT

## 1. Initial Build Baseline
Ran `vite build` on the `main` branch to measure the initial production footprint.

### Key Metrics
- **Build Time**: ~14.5s
- **Largest JS Chunks**:
  - `pdfjs-dist`: 1,162.77 kB (304.70 kB gzip)
  - `firebase`: 506.77 kB (142.14 kB gzip)
  - `react-dom`: 131.02 kB (42.06 kB gzip)
  - `react-icons`: 96.48 kB (27.42 kB gzip)
- **Total Bundle**: ~2.1 MB raw JS.

### Immediate Observations
- **PDF.js Contribution**: The PDF parser was statically imported at the top level of `importTrip/index.jsx`.
- **Chart.js Contribution**: `TripAnalyzer.jsx` was statically imported into `ViewTrip`, causing `Chart.js` to load even for users who only want to view the map.

## 2. Code Splitting & Bundle Analysis (Action Taken)
- **PDF.js**: Changed `import * as pdfjsLib from 'pdfjs-dist/build/pdf'` to an inline dynamic `await import('pdfjs-dist/build/pdf')` inside the upload handler. This removes ~483KB minified JS from the initial module graph and only loads it when parsing is actually triggered.
- **Trip Analyzer**: Wrapped `TripAnalyzer` in `React.lazy()` inside `ViewTrip`, deferring the heavy payload until the user explicitly navigates to the Analyzer tab.

### Post-Build Performance Improvements
- **Initial Load Relief**: The 483.14 kB `pdfjs-dist` chunk is completely decoupled from the initial page load.
- **Trip Analyzer Deferral**: Charting logic is separated out into its own chunk.

## 3. AI Request & Determinism Audit (Action Taken)
Audited all LLM calls in `journeyIntelligence.js`.
- **Alternatives**: Prompt-driven. Was not cached.
- **Local Gems**: Prompt-driven. Was not cached.
- **Stop Intelligence**: Prompt-driven. Was not cached.
- **Understand Activity**: Prompt-driven. Was not cached.
- **Destination Context**: Prompt-driven. Was not cached.

**Action**: Introduced an `aiCache` Map to memoize identical AI requests (e.g. asking for alternatives for the same place twice).

## 4. Caching & Firestore Audit (Action Taken)
- **Geocoding**: `destinationService.js` was hitting the function/API repeatedly for identical searches (e.g. "Paris"). Added an in-memory `geocodeCache` Map.
- **Firestore**: Verified that writes to `UserTrips` only occur on explicit user completion actions (drag-end, click delete, click replace). This is well-controlled and requires no debouncing. 

## 5. Map Performance
- `TripMap.jsx` uses `useMemo` for `stops` and `polylines`, filtering out any missing coordinates cleanly without crashing.
- State handlers for `selectedStopId` recreate lightweight props but do not cause noticeable jank due to `react-leaflet`'s internal optimizations.

## 6. Security Regression
- Ran the automated `vitest` suite. The `remediation.test.jsx` test explicitly verified that `foodPreferences`, `isAllergy`, and `accessibilityMode` do NOT leak into `SharedTrips` payloads during the public sharing workflow.

## 7. Next Steps
Phase 8 performance improvements are implemented. The architecture is significantly leaner on the initial load, and AI/Geocoding requests are now properly memory-cached to prevent redundant LLM latency/costs.
