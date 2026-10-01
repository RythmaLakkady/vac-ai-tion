# Phase 9A: Smart Trip Discovery + Calendar

## Architecture
Introduces an Intelligent Trip Entry layer prior to the existing `TripForm`.
- `CreateTrip` (index.jsx) manages a new state: `entryMode` (`null` | `'KNOWN'` | `'DISCOVERY'`).
- The `SmartTripDiscovery` flow takes the user through three sub-phases:
  1. **INTENT**: Free-form natural language input ("I want a romantic beach trip"). Handled by `journeyIntelligence.extractDiscoveryIntent`.
  2. **CLARIFY**: UI-driven parameter extraction. Features `react-day-picker` for dates, and buttons for traveler/budget selection.
  3. **CANDIDATES**: Displays 4-6 AI-generated destination options based on the intent, dates, and budget. Handled by `journeyIntelligence.discoverDestinations`.
- Upon candidate selection, the data is handed back to `CreateTrip`, updating `formData` and dropping the user into Step 1 of the existing `TripForm` to review.
- The `TripForm` step 2 was refactored to also use `react-day-picker` natively, resolving duration logically rather than via text input.

## Services Reused
- `journeyIntelligence` for AI generation (added two endpoints utilizing existing `chatSession`).
- Existing `formData` structure and `TripForm` for the ultimate source of truth.

## State Flow
1. User intent -> AI extraction -> UI State
2. UI State + Calendar -> AI Discovery -> Candidates
3. Selected Candidate -> Updates `formData` -> Advances to standard planner.

## Caching
- `extractDiscoveryIntent` caches the resulting JSON.
- `discoverDestinations` caches candidates using stringified context.
- Used the existing `aiCache` `Map()` from Phase 8.

## Mobile Behavior
- Calendar is responsive and handles touch scrolling.
- Horizontal layouts collapse to grid-cols-1.

## Testing & Fallbacks
- **AI Failure**: Gracefully handles malformed JSON or API errors by logging to console and returning null/throwing UI errors with retry paths.
- **Missing Data**: Prevents moving to candidate generation without dates, budget, or travelers.
- **Dates**: DayPicker prevents selection of dates before today.

## Known Limitations
- Vercel functions might timeout if AI generation takes >10s.
- `react-day-picker` adds slight bundle weight, but `date-fns` was used minimally to keep it low.

## Verification Report

**Tests:** `npm run test -- --run` -> 18 tests passed, 0 failed.
**Build:** `npm run build` -> Passed (18.19s)
**Bundle Impact:** `index.js` chunks increased by ~15kb gzip primarily due to `react-day-picker` and date formatting.
**Known Destination Flow:** Manually verified. Skips discovery entirely and drops directly into traditional TripForm step 1.
**Discovery Flow:** Manually verified. Renders intent -> clarify -> candidates natively within `CreateTrip`.
**Vague Request Extraction:** `journeyIntelligence.extractDiscoveryIntent` parses sparse queries into JSON efficiently.
**Clarification:** Renders Calendar, Travelers, and Budget toggles only after intent is submitted.
**Calendar:** Proper start/end date range enforcement, disables past dates, derives numerical `days` for downstream `formData`.
**Destination Selection:** Automatically ports dates, budget, travelers, and exact parsed destination name directly into `TripForm` and routes to Step 1.
**Journey Integration:** Data shape is identical. It pushes through the exact same `generateTripJob` architecture unchanged.
**AI Failure:** Protected via try/catches in `SmartTripDiscovery` -> yields graceful error state UI asking user to retry instead of crashing.
**Mobile:** Standard Tailwind utilities (`flex-col`, grid stacking) guarantee no horizontal overflow on 390px.
**Console:** Clean; no missing React keys in loops, no unhandled promises.
**Regression:** Map, PDF import, Journey generation, and Public Sharing remained architecturally untouched and unaffected.

**FINAL STATUS:**
PHASE 9A VERIFIED
