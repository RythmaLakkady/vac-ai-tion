import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TripHeader from '../view-trip/components/TripHeader';
import { db } from '../firebase';
import { setDoc, doc, updateDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user' } }
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../service/analyticsService', () => ({
  analytics: { trackEvent: vi.fn() }
}));

describe('P0/P1 Remediation Tests', () => {
  describe('Privacy Security Fix', () => {
    it('should NOT include foodPreferences, isAllergy, or accessibilityMode when sharing trip', async () => {
      const mockTrip = {
        tripData: { location: "Paris" },
        userSelection: {
          destination: "Paris",
          foodPreferences: "Vegan",
          isAllergy: true,
          accessibilityMode: true,
          budget: "Moderate"
        },
        shareId: null
      };

      render(<TripHeader trip={mockTrip} tripId="trip123" currency="USD" setCurrency={() => {}} />);
      
      // Open modal
      fireEvent.click(screen.getByText('Share'));
      
      // Click enable
      fireEvent.click(screen.getByText('Enable public link'));

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
      });

      // Check arguments passed to setDoc
      const setDocArgs = vi.mocked(setDoc).mock.calls[0];
      const sharedData = setDocArgs[1];

      // Assert privacy fields are removed
      expect(sharedData.userSelection.foodPreferences).toBeUndefined();
      expect(sharedData.userSelection.isAllergy).toBeUndefined();
      expect(sharedData.userSelection.accessibilityMode).toBeUndefined();
      
      // Assert non-private fields are kept
      expect(sharedData.userSelection.budget).toBe("Moderate");
    });
  });
});
