import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import JourneyChapter from '../JourneyChapter';
import JourneyStop from '../JourneyStop';
import JourneyTransition from '../JourneyTransition';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

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

const TestWrapper = ({ children }) => (
  <DragDropContext onDragEnd={() => {}}>
    <Droppable droppableId="test-droppable" type="activity">
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

describe('JourneyStop', () => {
  it('renders activity details correctly', () => {
    render(<TestWrapper><JourneyStop activity={mockActivity} dayIndex={0} activityIndex={0} /></TestWrapper>);
    
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Attraction')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('safely handles missing optional data', () => {
    render(<TestWrapper><JourneyStop activity={{ place_name: 'Missing Data Place' }} dayIndex={0} activityIndex={0} /></TestWrapper>);
    
    expect(screen.getByText('Missing Data Place')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('expands to show details when clicked', () => {
    render(<TestWrapper><JourneyStop activity={mockActivity} dayIndex={0} activityIndex={0} /></TestWrapper>);
    
    expect(screen.queryByText('"Must see in Paris"')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    
    expect(screen.getByText('"Must see in Paris"')).toBeInTheDocument();
    expect(screen.getByText('€25')).toBeInTheDocument();
  });
});

describe('JourneyTransition', () => {
  it('renders a transition correctly', () => {
    render(<JourneyTransition fromStop={mockActivity} toStop={mockDay.activities[1]} />);
    expect(screen.getByText('Transport details unavailable')).toBeInTheDocument();
  });
});

describe('JourneyChapter', () => {
  it('renders day title and brief', () => {
    render(<ChapterWrapper><JourneyChapter day={mockDay} dayIndex={0} /></ChapterWrapper>);
    
    expect(screen.getByText('Day 01')).toBeInTheDocument();
    expect(screen.getByText('Classic Paris')).toBeInTheDocument();
    expect(screen.getByText('A day of iconic sights.')).toBeInTheDocument();
  });

  it('renders correct number of stops and transitions', () => {
    render(<ChapterWrapper><JourneyChapter day={mockDay} dayIndex={0} /></ChapterWrapper>);
    
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Louvre')).toBeInTheDocument();
    expect(screen.getAllByText('Transport details unavailable').length).toBe(1);
  });
});
