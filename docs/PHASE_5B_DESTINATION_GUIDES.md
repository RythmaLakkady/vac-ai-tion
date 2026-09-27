# Phase 5B — Contextual Destination Guides

## 1. Objective
Make Destination Guides a contextual intelligence layer attached to the Journey, rather than a separate encyclopedia page. 

## 2. Architecture & Journey Integration
The Destination Guide is implemented as a sliding panel overlay in the Journey workspace (`Journey/index.jsx`). 
- On desktop, it swaps with the Trip Map on the right-hand panel, preserving the Journey timeline on the left.
- On mobile, it utilizes the existing mobile map modal overlay pattern.
- This satisfies the requirement: "The guide should feel like another chapter of the Journey, not a completely different product."

## 3. Contextual Data Flow
When a user clicks "Explore {Area}" on a `JourneyStop`, the guide is opened with full journey context:
- `currentStop`: The stop they clicked from.
- `previousStop`: The preceding stop in the timeline.
- `nextStop`: The subsequent stop in the timeline.
- `budget` & `traveler`: Trip-level profile preferences.

This context is fed into the `getDestinationContext` LLM prompt in `journeyIntelligence.js`, which ensures the guide explains *why* the user is in this area in the context of their specific itinerary, rather than just returning generic wiki facts.

## 4. Guide Sections
The generated guide strictly adheres to the requested JSON schema:
1. **Overview**: Short editorial introduction.
2. **Why you're here**: Explains the relationship between the destination and the current journey.
3. **Journey Impact**: Actionable advice affecting the schedule (e.g. "This museum usually takes 3 hours. Consider moving your next stop later.").
4. **Know Before You Go**: Practical tips (opening times, etiquette, reservations).
5. **Useful Resources**: External links to official tourism boards or reputable guides.

## 5. Analytics
The following analytics events have been implemented:
- `destination_guide_opened`: Fired when the guide panel mounts, capturing the place name and location.
- `destination_guide_resource_clicked`: Fired when an outbound external resource link is clicked, tracking the source stop and destination URL.

## 6. Error & Loading States
- **Loading**: Displays a pulsing compass with "Generating context..."
- **Error**: Shows an `AlertCircle` with the error message and a "Try again" button. Falls back gracefully if the LLM fails.

## 7. Known Limitations
- "Nearby" section inside the guide is currently omitted to avoid duplicating the Phase 5A `Explore Nearby` tab which already exists directly on the `JourneyStop`. 
- Journey Impact is currently text-based advice. A direct "Adjust Journey" automated re-scheduling action requires future integration with a dedicated scheduling engine.

## 8. Testing & Validation
- Ran `npm run test -- run` and all tests pass (including `Journey.test.jsx`).
- Analytics events fire correctly.
- Contextual LLM prompt returns valid JSON reliably.
