/**
 * Tests unitaires pour useGovernanceRACI
 * PHASE 5 : Tests & Qualité
 */

import { renderHook, act } from '@testing-library/react';
import { useGovernanceRACI } from '@/hooks/useGovernanceRACI';

describe('useGovernanceRACI', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGovernanceRACI());

    expect(result.current.selectedActivity).toBeNull();
    expect(result.current.editMode).toBe(false);
    expect(result.current.showComparator).toBe(false);
    expect(result.current.showAISuggestions).toBe(true);
    expect(result.current.showHeatmap).toBe(true);
  });

  it('should calculate stats correctly', () => {
    const { result } = renderHook(() => useGovernanceRACI());

    expect(result.current.stats).toHaveProperty('total');
    expect(result.current.stats).toHaveProperty('critical');
    expect(result.current.stats).toHaveProperty('locked');
    expect(result.current.stats).toHaveProperty('bmoGoverned');
    expect(typeof result.current.stats.total).toBe('number');
  });

  it('should update selected activity', () => {
    const { result } = renderHook(() => useGovernanceRACI());

    act(() => {
      result.current.setSelectedActivity('Test Activity');
    });

    expect(result.current.selectedActivity).toBe('Test Activity');
  });

  it('should toggle edit mode', () => {
    const { result } = renderHook(() => useGovernanceRACI());

    act(() => {
      result.current.setEditMode(true);
    });

    expect(result.current.editMode).toBe(true);
  });

  it('should toggle comparator', () => {
    const { result } = renderHook(() => useGovernanceRACI());

    act(() => {
      result.current.setShowComparator(true);
    });

    expect(result.current.showComparator).toBe(true);
  });

  it('should return raciData and bureaux', () => {
    const { result } = renderHook(() => useGovernanceRACI());

    expect(Array.isArray(result.current.raciData)).toBe(true);
    expect(Array.isArray(result.current.bureaux)).toBe(true);
    expect(result.current.bureaux.length).toBeGreaterThan(0);
  });
});

