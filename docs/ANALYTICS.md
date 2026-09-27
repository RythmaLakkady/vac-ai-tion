# Analytics Architecture

## Overview
VAC-AI-TION uses a custom, privacy-conscious analytics system built on top of Firestore. It is designed to track product usage, funnel conversion, and system reliability without collecting sensitive personal information.

## Collections

### `analytics_events`
Stores individual events.
- **event_name**: String (e.g. `page_view`, `trip_generation_started`)
- **timestamp**: Firestore Timestamp
- **session_id**: String (anonymous UUID generated per session)
- **user_id**: String (anonymous UUID or "anonymous" if not logged in; never raw email/password)
- **metadata**: Map (e.g., `{ destination: "Paris", duration: 5 }`)
- **path**: String (URL path)

### `analytics_sessions`
Stores session-level aggregates.
- **session_id**: String
- **start_time**: Timestamp
- **end_time**: Timestamp
- **user_id**: String
- **landing_page**: String
- **referrer**: String

## Tracked Events
- `page_view`
- `landing_view`
- `planner_opened`
- `trip_generation_started`
- `trip_generation_completed`
- `trip_generation_failed`
- `destination_selected`
- `itinerary_viewed`
- `itinerary_edited`
- `activity_added`
- `activity_removed`
- `alternative_requested`
- `map_opened`
- `destination_guide_opened`
- `blog_opened`
- `price_comparison_opened`
- `external_link_clicked`
- `trip_saved`
- `trip_shared`
- `signup_started`
- `signup_completed`
- `login_completed`
- `error_boundary_caught`
- `api_failure`

## Privacy Policy
1. No passwords, API keys, or raw authentication credentials are logged.
2. User emails are not logged in analytics events.
3. Event payloads are sanitized before being sent.
4. Clients can only append to `analytics_events`. They cannot read them. Only authorized admin accounts can read analytics data.

## Implementation Details
The `analyticsService.js` uses a singleton pattern to track the `session_id`. It automatically intercepts unhandled errors and tracks page views via a React hook (`useAnalytics.js`).
