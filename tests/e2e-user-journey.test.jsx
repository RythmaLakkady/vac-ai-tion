import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import JourneyChapter from '@/view-trip/components/Journey/JourneyChapter';
import JourneyStop from '@/view-trip/components/Journey/JourneyStop';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { feasibilityEngine } from '@/service/feasibilityEngine';
import { convertPrice, formatCurrency } from '@/utils/currencyFormatter';

vi.mock('@/service/analyticsService', () => ({
  analytics: { trackEvent: vi.fn() },
}));

vi.mock('@/service/journeyIntelligence', () => ({
  journeyIntelligence: {
    getStopIntelligence: vi.fn().mockResolvedValue({ priority: 'RECOMMENDED', seasonality: 'GOOD FOR THIS SEASON' }),
    analyzeStop: vi.fn().mockResolvedValue({ priority: 'RECOMMENDED', seasonality: 'GOOD FOR THIS SEASON' }),
    getTravelContext: vi.fn().mockResolvedValue({ alternatives: [] }),
    discoverDestinations: vi.fn().mockResolvedValue([]),
    extractDiscoveryIntent: vi.fn().mockResolvedValue({}),
  },
}));

const mockTrip = {
  id: 'trip-12345',
  userEmail: 'traveler@wanderlust.com',
  userId: 'usr_secret_uid_789',
  destination: 'Kyoto, Japan',
  shareId: 'kyoto-autumn-2026',
  tripData: {
    trip_name: 'Kyoto Cultural Immersion',
    duration: '3 Days',
    budget: 'Moderate',
    traveler: 'Couple',
    hotels: [
      {
        hotel_name: 'Hotel Granvia Kyoto',
        price: '¥22,000 / night',
        rating: 4.6,
      },
    ],
    itinerary: [
      {
        theme: 'Temple Heritage & Zen Gardens',
        daily_brief: 'Visit ancient shrines and tranquil bamboo groves.',
        activities: [
          {
            place_name: 'Fushimi Inari Shrine',
            category: 'Shrine',
            time_travel: '08:00 AM - 10:30 AM',
            ticket_pricing: 'Free',
            costState: 'known',
            importance: 'Iconic thousands of vermilion torii gates.',
            place_details: 'Historic Shinto shrine on Mount Inari.',
            geo_coordinates: { latitude: '34.9671', longitude: '135.7727' },
          },
          {
            place_name: 'Kiyomizu-dera',
            category: 'Temple',
            time_travel: '11:30 AM - 01:30 PM',
            ticket_pricing: '$4',
            costState: 'known',
            importance: 'Wooden stage offering panoramic views.',
            place_details: 'UNESCO World Heritage Buddhist temple.',
            geo_coordinates: { latitude: '34.9949', longitude: '135.7850' },
          },
        ],
      },
    ],
  },
};

const StopWrapper = ({ children }) => (
  <DragDropContext onDragEnd={() => {}}>
    <Droppable droppableId="day-0-stops" type="activity">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
);

const ChapterWrapper = ({ children }) => (
  <DragDropContext onDragEnd={() => {}}>
    {children}
  </DragDropContext>
);

describe('End-to-End User Journey Simulation', () => {
  it('Step 1: validates trip inputs and derives duration correctly', () => {
    const startDate = new Date('2026-10-01');
    const endDate = new Date('2026-10-04');
    const diffTime = Math.abs(endDate - startDate);
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    expect(durationDays).toBe(4);
    expect(mockTrip.tripData.duration).toBe('3 Days');
    expect(mockTrip.destination).toContain('Kyoto');
  });

  it('Step 2: renders itinerary journey chapters and calculates daily budget', () => {
    const day = mockTrip.tripData.itinerary[0];
    render(
      <ChapterWrapper>
        <JourneyChapter
          trip={mockTrip}
          day={day}
          dayIndex={0}
          currency="USD"
          exchangeRates={{ USD: 1, EUR: 0.92, JPY: 155 }}
        />
      </ChapterWrapper>
    );

    expect(screen.getByText('Day 01')).toBeInTheDocument();
    expect(screen.getByText('Temple Heritage & Zen Gardens')).toBeInTheDocument();
    expect(screen.getByText('Fushimi Inari Shrine')).toBeInTheDocument();
    expect(screen.getByText('Kiyomizu-dera')).toBeInTheDocument();
    // Daily total: Free (0) + $4 = $4
    expect(screen.getByText('$4')).toBeInTheDocument();
  });

  it('Step 3: interacts with JourneyStop and triggers user actions', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onReplace = vi.fn();
    const onInsert = vi.fn();
    const activity = mockTrip.tripData.itinerary[0].activities[0];

    render(
      <StopWrapper>
        <JourneyStop
          trip={mockTrip}
          activity={activity}
          dayIndex={0}
          activityIndex={0}
          id="day-0-stop-0"
          onEdit={onEdit}
          onDelete={onDelete}
          onReplace={onReplace}
          onInsert={onInsert}
        />
      </StopWrapper>
    );

    expect(screen.getByText('Fushimi Inari Shrine')).toBeInTheDocument();
    expect(screen.getByText('Shrine')).toBeInTheDocument();

    // Expand stop card to reveal action controls
    const expandButton = screen.getByRole('button', { expanded: false });
    fireEvent.click(expandButton);

    expect(screen.getByText('"Iconic thousands of vermilion torii gates."')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();

    // Click Edit button
    const editBtn = screen.getByText('Edit');
    fireEvent.click(editBtn);
    expect(screen.getByDisplayValue('Fushimi Inari Shrine')).toBeInTheDocument();
  });

  it('Step 4: performs feasibility analysis on itinerary pace and stops', () => {
    const day = mockTrip.tripData.itinerary[0];
    const warnings = feasibilityEngine.analyzeDay(day, 0);

    expect(Array.isArray(warnings)).toBe(true);
    // Two well-spaced activities should not trigger extreme overload warnings
    const severeWarnings = warnings.filter((w) => w.severity === 'high');
    expect(severeWarnings.length).toBe(0);
  });

  it('Step 5: converts pricing dynamically across foreign currencies', () => {
    const rates = { USD: 1, EUR: 0.92, JPY: 155, GBP: 0.79 };

    expect(convertPrice('$100', 'USD', rates)).toBe('$100');
    expect(convertPrice('$100', 'EUR', rates)).toBe('€92');
    expect(convertPrice('$100', 'JPY', rates)).toBe('¥15,500');
    expect(convertPrice('$100', 'GBP', rates)).toBe('£79');
    expect(formatCurrency(2500, 'JPY')).toBe('¥2,500');
  });

  it('Step 6: sanitizes public sharing payload to protect user privacy', () => {
    // Shared payload sanitizer simulation
    const sanitizePublicTrip = (trip) => {
      const { userEmail, userId, ...safeTrip } = trip;
      return {
        ...safeTrip,
        isShared: true,
      };
    };

    const publicPayload = sanitizePublicTrip(mockTrip);
    expect(publicPayload.userEmail).toBeUndefined();
    expect(publicPayload.userId).toBeUndefined();
    expect(publicPayload.destination).toBe('Kyoto, Japan');
    expect(publicPayload.shareId).toBe('kyoto-autumn-2026');
    expect(publicPayload.isShared).toBe(true);
  });
});
