/**
 * Tests unitaires pour useGovernanceFilters
 * PHASE 5 : Tests & Qualité
 */

import { renderHook, act } from '@testing-library/react';
import { useGovernanceFilters } from '@/hooks/useGovernanceFilters';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    toString: jest.fn(() => ''),
  }),
}));

describe('useGovernanceFilters', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGovernanceFilters());

    expect(result.current.activeTab).toBe('raci');
    expect(result.current.search).toBe('');
    expect(result.current.filters).toEqual({});
  });

  it('should update search value', () => {
    const { result } = renderHook(() => useGovernanceFilters());

    act(() => {
      result.current.updateSearch('test search');
    });

    expect(result.current.search).toBe('test search');
  });

  it('should update filters', () => {
    const { result } = renderHook(() => useGovernanceFilters());

    const newFilters = { severity: 'critical', type: 'system' };

    act(() => {
      result.current.updateFilters(newFilters);
    });

    expect(result.current.filters).toEqual(newFilters);
  });

  it('should update active tab', () => {
    const { result } = renderHook(() => useGovernanceFilters());

    act(() => {
      result.current.updateTab('alerts');
    });

    expect(result.current.activeTab).toBe('alerts');
  });
});

