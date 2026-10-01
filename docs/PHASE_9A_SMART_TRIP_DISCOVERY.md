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
