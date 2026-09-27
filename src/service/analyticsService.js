import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class AnalyticsService {
  constructor() {
    this.sessionId = this._getOrCreateSessionId();
  }

  _getOrCreateSessionId() {
    let sid = sessionStorage.getItem('vac_session_id');
    if (!sid) {
      sid = generateUUID();
      sessionStorage.setItem('vac_session_id', sid);
    }
    return sid;
  }

  async trackEvent(eventName, metadata = {}) {
    try {
      // Clean metadata (remove sensitive stuff if it somehow sneaks in)
      const cleanMetadata = { ...metadata };
      delete cleanMetadata.password;
      delete cleanMetadata.apiKey;
      delete cleanMetadata.email; // Privacy conscious

      const eventData = {
        event_name: eventName,
        session_id: this.sessionId,
        user_id: auth.currentUser?.uid || 'anonymous',
        path: window.location.pathname,
        timestamp: serverTimestamp(),
        metadata: cleanMetadata
      };

      await addDoc(collection(db, 'analytics_events'), eventData);
    } catch (error) {
      // Fail silently to avoid breaking the app if analytics fails
      console.warn("Analytics tracking failed:", error);
    }
  }

  // Convenience methods
  pageView(path) {
    this.trackEvent('page_view', { path });
  }

  tripGenerationStarted(destination, days) {
    this.trackEvent('trip_generation_started', { destination, days });
  }

  tripGenerationCompleted(jobId, latencyMs) {
    this.trackEvent('trip_generation_completed', { jobId, latencyMs });
  }

  tripGenerationFailed(reason) {
    this.trackEvent('trip_generation_failed', { reason });
  }

  apiFailure(endpoint, status) {
    this.trackEvent('api_failure', { endpoint, status });
  }
}

export const analytics = new AnalyticsService();
