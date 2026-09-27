# JOURNEY UX SPECIFICATION

## 1. Journey Model

The core conceptual shift is moving from a **list of activities** to a **continuous journey**. 

The hierarchy is defined as:
```text
Trip (Document root)
 └── Journey (State source of truth)
      ├── Day (Chapter with rhythm/theme)
      │    ├── Stop (Activity/Location)
      │    ├── Transition (Travel between stops)
      │    └── Stop 
      ├── Route (Map representation)
      ├── Budget (Financial consumption)
      ├── Alternatives (Contextual replacements)
      └── Insights (Derived context: pace, free time)
```

## 2. Information Hierarchy

When looking at the journey, the user must understand information in this strict priority:
1. **"Where am I going?"** (Day structure, location names)
2. **"What am I doing?"** (Activity category, description)
3. **"How am I getting there?"** (Transitions between stops)
4. **"What happens next?"** (Visual flow to next stop)
5. **Details on demand** (Cost, links, notes hidden inside expandable cards)

## 3. Data Dependencies & Architecture

The application will adapt the existing `tripData.itinerary` Firestore model rather than forcing a database schema rewrite. 

### Component Architecture
* **`JourneyStateProvider` / Central Hook**: Manages the `itinerary` array in `ViewTrip` and synchronizes it across Roadmap, Timeline, Map, and Budget views.
* **`JourneyChapter (Day)`**: Renders a single day block. Computes transitions based on consecutive stop locations and times.
* **`JourneyStop (Activity)`**: Renders a single activity card. Handles edit, delete, and replace actions.
* **`JourneyTransition`**: A visual connector between two `JourneyStop`s showing travel mode, distance, and duration.
* **`JourneyMap`**: Listens to the active/selected `JourneyStop` and updates map markers/routes.

### Schema Adaptation
* **Day**: Extracted from `itinerary[i]`.
* **Stop**: Extracted from `itinerary[i].activities[j]`.
* **Transition**: Derived by comparing `activities[j]` and `activities[j+1]`. Will utilize `ola-maps-react` or distance matrix estimation for routing where precise data is missing.

## 4. User Interactions

Users can actively edit the journey:
* **Drag & Drop**: Reorder stops within a day or move across days.
* **Replace (Alternatives)**: Inline contextual menu offering 3 alternatives (cheaper, closer, different vibe) based on the destination service.
* **Map Sync**: Clicking a marker scrolls to the stop in the itinerary. Clicking a stop centers the map.
* **Budget Reactivity**: Modifying a stop recalculates the daily and total trip budget instantly.

## 5. Responsive Behavior

**Desktop**: 
* Left/Right split (or interactive roadmap) with the Map pinned to the side. 
* Wide cards showing details progressively.

**Mobile**: 
* Vertical scrolling timeline: `Stop -> Transition -> Stop`.
* Map becomes an expandable bottom sheet or a floating action button overlay.
* Swipe actions for quick delete/edit.

## 6. Edge Cases & Fallbacks

* **Missing Location/Routing**: If a transition cannot be calculated, fallback to a generic "Move to next location" connector without a strict time.
* **Missing Prices**: Do not break budget math; flag item as "Price unknown".
* **Time Collisions**: If dragging an activity causes overlapping times, highlight the collision in red and offer a "Smart Reschedule" button to push subsequent activities down.
* **Offline/API failure**: Save edits locally and sync to Firestore when reconnected. (If applicable).

## 7. Next Steps (Execution)
This specification serves as the architectural blueprint for Sprints 2-8. The implementation will proceed sequentially, starting with the Journey Shell and Day Chapters (Sprint 2).
