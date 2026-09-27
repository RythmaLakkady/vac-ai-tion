import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import JourneyChapter from '../JourneyChapter';
import JourneyStop from '../JourneyStop';
import JourneyTransition from '../JourneyTransition';

// Mock analytics to prevent real network calls
vi.mock('@/service/analyticsService', () => ({
  analytics: { trackEvent: vi.fn() }
}));

const mockActivity = {
  place_name: 'Eiffel Tower',
  category: 'Attraction',
  time_travel: '10:00 AM',
  ticket_pricing: '€25',
  importance: 'Must see in Paris',
  place_details: 'Iconic iron lattice tower on the Champ de Mars.',
};

const mockDay = {
  theme: 'Classic Paris',
  daily_brief: 'A day of iconic sights.',
  activities: [mockActivity, { ...mockActivity, place_name: 'Louvre', time_travel: '2:00 PM' }]
};

describe('JourneyStop', () => {
  it('renders activity details correctly', () => {
    render(<JourneyStop activity={mockActivity} dayIndex={0} activityIndex={0} />);
    
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Attraction')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('safely handles missing optional data', () => {
    render(<JourneyStop activity={{ place_name: 'Missing Data Place' }} dayIndex={0} activityIndex={0} />);
    
    expect(screen.getByText('Missing Data Place')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('expands to show details when clicked', () => {
    render(<JourneyStop activity={mockActivity} dayIndex={0} activityIndex={0} />);
    
    // Initially hidden
    expect(screen.queryByText('"Must see in Paris"')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    
    // Details should be visible
    expect(screen.getByText('"Must see in Paris"')).toBeInTheDocument();
    expect(screen.getByText('€25')).toBeInTheDocument();
  });
});

describe('JourneyTransition', () => {
  it('renders a transition correctly', () => {
    render(<JourneyTransition fromStop={mockActivity} toStop={mockDay.activities[1]} />);
    expect(screen.getByText('Travel details unavailable')).toBeInTheDocument();
  });
});

describe('JourneyChapter', () => {
  it('renders day title and brief', () => {
    render(<JourneyChapter day={mockDay} dayIndex={0} />);
    
    expect(screen.getByText('Day 01')).toBeInTheDocument();
    expect(screen.getByText('Classic Paris')).toBeInTheDocument();
    expect(screen.getByText('A day of iconic sights.')).toBeInTheDocument();
  });

  it('renders correct number of stops and transitions', () => {
    render(<JourneyChapter day={mockDay} dayIndex={0} />);
    
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Louvre')).toBeInTheDocument();
    expect(screen.getAllByText('Travel details unavailable').length).toBe(1);
  });
});
