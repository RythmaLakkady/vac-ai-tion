import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import JourneyChapter from '@/view-trip/components/Journey/JourneyChapter';
import TripMap from '@/view-trip/components/Journey/TripMap';
import { DragDropContext } from '@hello-pangea/dnd';

// Mock analytics to prevent real network calls
vi.mock('@/service/analyticsService', () => ({
  analytics: { trackEvent: vi.fn() },
}));

// Mock react-leaflet to prevent Leaflet DOM/canvas errors in jsdom
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({ fitBounds: vi.fn(), flyTo: vi.fn(), setView: vi.fn() }),
}));

vi.mock('leaflet', () => ({
  default: {
    latLngBounds: () => ({
      isValid: () => true,
      extend: vi.fn(),
    }),
    divIcon: () => ({}),
  },
}));

const ChapterWrapper = ({ children }) => (
  <DragDropContext onDragEnd={() => {}}>
    {children}
  </DragDropContext>
);

describe('React Hook Order Regressions', () => {
  describe('JourneyChapter hook stability', () => {
    it('renders empty day without hook violations or crash', () => {
      const { container } = render(
        <ChapterWrapper>
          <JourneyChapter day={{ activities: [] }} dayIndex={0} />
        </ChapterWrapper>
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders day without activities array gracefully', () => {
      const { container } = render(
        <ChapterWrapper>
          <JourneyChapter day={{}} dayIndex={0} />
        </ChapterWrapper>
      );
      expect(container.firstChild).toBeNull();
    });

    it('does not crash when dynamically toggling from populated to empty activities', () => {
      const populatedDay = {
        theme: 'Historic Exploration',
        daily_brief: 'Visit key museums.',
        activities: [
          { place_name: 'Museum of Art', ticket_pricing: '$20', time_travel: '10:00 AM' },
        ],
      };
      const emptyDay = { activities: [] };

      const { rerender } = render(
        <ChapterWrapper>
          <JourneyChapter day={populatedDay} dayIndex={0} />
        </ChapterWrapper>
      );

      expect(screen.getByText('Historic Exploration')).toBeInTheDocument();

      // Rerender with empty activities — ensures hooks (useEffect) run in identical order
      expect(() => {
        rerender(
          <ChapterWrapper>
            <JourneyChapter day={emptyDay} dayIndex={0} />
          </ChapterWrapper>
        );
      }).not.toThrow();

      // Rerender back to populated
      expect(() => {
        rerender(
          <ChapterWrapper>
            <JourneyChapter day={populatedDay} dayIndex={0} />
          </ChapterWrapper>
        );
      }).not.toThrow();
      expect(screen.getByText('Historic Exploration')).toBeInTheDocument();
    });
  });

  describe('TripMap hook stability', () => {
    it('renders empty state placeholder without hook order crash when no stops exist', () => {
      render(<TripMap itinerary={[]} />);
      expect(screen.getByText('Map unavailable')).toBeInTheDocument();
      expect(
        screen.getByText('No trustworthy location data found for this itinerary.')
      ).toBeInTheDocument();
    });

    it('handles dynamic transition from valid coordinates to empty itinerary', () => {
      const itineraryWithCoords = [
        {
          activities: [
            {
              place_name: 'Tokyo Tower',
              geo_coordinates: { latitude: '35.6586', longitude: '139.7454' },
            },
            {
              place_name: 'Senso-ji',
              geo_coordinates: { latitude: '35.7148', longitude: '139.7967' },
            },
          ],
        },
      ];

      const { rerender } = render(<TripMap itinerary={itineraryWithCoords} />);
      expect(screen.getByTestId('map-container')).toBeInTheDocument();

      // Rerender with empty itinerary — verify polylines and stops useMemo hook order preserved
      expect(() => {
        rerender(<TripMap itinerary={[]} />);
      }).not.toThrow();
      expect(screen.getByText('Map unavailable')).toBeInTheDocument();

      // Rerender back to coordinates
      expect(() => {
        rerender(<TripMap itinerary={itineraryWithCoords} />);
      }).not.toThrow();
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });
});

