import { describe, it, expect } from 'vitest';
import { feasibilityEngine } from '../feasibilityEngine';

describe('feasibilityEngine', () => {
  it('detects overloaded days (5+ stops)', () => {
    const day = {
      activities: [
        { place_name: 'Stop 1' },
        { place_name: 'Stop 2' },
        { place_name: 'Stop 3' },
        { place_name: 'Stop 4' },
        { place_name: 'Stop 5' },
      ]
    };
    
    const warnings = feasibilityEngine.analyzeDay(day, 0);
    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'overload', severity: 'warning' })
      ])
    );
  });

  it('detects long travel transitions (>50km)', () => {
    const day = {
      activities: [
        { 
          place_name: 'Stop 1',
          geo_coordinates: { lat: 40.7128, lng: -74.0060 } // NYC
        },
        { 
          place_name: 'Stop 2',
          geo_coordinates: { lat: 39.9526, lng: -75.1652 } // Philly (~130km away)
        }
      ]
    };
    
    const warnings = feasibilityEngine.analyzeDay(day, 0);
    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'distance', severity: 'warning' })
      ])
    );
  });

  it('does not warn for short transitions', () => {
    const day = {
      activities: [
        { 
          place_name: 'Stop 1',
          geo_coordinates: { lat: 40.7128, lng: -74.0060 } 
        },
        { 
          place_name: 'Stop 2',
          geo_coordinates: { lat: 40.7130, lng: -74.0070 } // Very close
        }
      ]
    };
    
    const warnings = feasibilityEngine.analyzeDay(day, 0);
    const hasDistanceWarn = warnings.some(w => w.type === 'distance');
    expect(hasDistanceWarn).toBe(false);
  });
});
