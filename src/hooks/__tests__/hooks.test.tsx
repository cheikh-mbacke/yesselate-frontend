/**
 * Exemples de tests pour les nouveaux hooks
 * Framework: Jest + React Testing Library
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDelegationToast } from '@/hooks/useDelegationToast';

describe('useHotkeys', () => {
  it('should trigger callback on hotkey press', () => {
    const callback = jest.fn();
    renderHook(() => useHotkeys('ctrl+s', callback));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not trigger when disabled', () => {
    const callback = jest.fn();
    renderHook(() => useHotkeys('ctrl+s', callback, { enabled: false }));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should support multiple key combinations', () => {
    const callback = jest.fn();
    renderHook(() => useHotkeys(['ctrl+a', 'ctrl+b'], callback));

    const eventA = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
    });

    const eventB = new KeyboardEvent('keydown', {
      key: 'b',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(eventA);
      window.dispatchEvent(eventB);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should ignore form elements by default', () => {
    const callback = jest.fn();
    renderHook(() => useHotkeys('ctrl+s', callback));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });

    act(() => {
      input.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});

describe('useUserPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should load default preferences', () => {
    const { result } = renderHook(() => useUserPreferences());

    expect(result.current.preferences.autoRefresh).toBe(true);
    expect(result.current.preferences.exportFormat).toBe('csv');
  });

  it('should persist preferences to localStorage', () => {
    const { result } = renderHook(() => useUserPreferences());

    act(() => {
      result.current.setAutoRefresh(false);
    });

    expect(result.current.preferences.autoRefresh).toBe(false);

    const stored = JSON.parse(localStorage.getItem('delegation:preferences') || '{}');
    expect(stored.autoRefresh).toBe(false);
  });

  it('should load preferences from localStorage', () => {
    const mockPrefs = {
      autoRefresh: false,
      exportFormat: 'json' as const,
    };

    localStorage.setItem('delegation:preferences', JSON.stringify(mockPrefs));

    const { result } = renderHook(() => useUserPreferences());

    expect(result.current.preferences.autoRefresh).toBe(false);
    expect(result.current.preferences.exportFormat).toBe('json');
  });

  it('should reset to default preferences', () => {
    const { result } = renderHook(() => useUserPreferences());

    act(() => {
      result.current.setAutoRefresh(false);
      result.current.setExportFormat('pdf');
    });

    expect(result.current.preferences.autoRefresh).toBe(false);
    expect(result.current.preferences.exportFormat).toBe('pdf');

    act(() => {
      result.current.resetPreferences();
    });

    expect(result.current.preferences.autoRefresh).toBe(true);
    expect(result.current.preferences.exportFormat).toBe('csv');
  });

  it('should synchronize between tabs', async () => {
    const { result } = renderHook(() => useUserPreferences());

    const storageEvent = new StorageEvent('storage', {
      key: 'delegation:preferences',
      newValue: JSON.stringify({ autoRefresh: false }),
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    await waitFor(() => {
      expect(result.current.preferences.autoRefresh).toBe(false);
    });
  });
});

describe('useDelegationToast', () => {
  beforeEach(() => {
    // Reset toast manager state
    jest.clearAllMocks();
  });

  it('should show success toast', () => {
    const { result } = renderHook(() => useDelegationToast());

    act(() => {
      result.current.success('Success title', 'Success message');
    });

    // Verify toast was added (you'd need to spy on toastManager)
    // This is a simplified example
  });

  it('should show error toast', () => {
    const { result } = renderHook(() => useDelegationToast());

    act(() => {
      result.current.error('Error title', 'Error message');
    });
  });

  it('should show delegation created toast', () => {
    const { result } = renderHook(() => useDelegationToast());

    act(() => {
      result.current.delegationCreated('DEL-001');
    });
  });

  it('should dismiss toast by id', () => {
    const { result } = renderHook(() => useDelegationToast());

    let toastId: string;

    act(() => {
      toastId = result.current.success('Test', 'Test message');
    });

    act(() => {
      result.current.dismiss(toastId);
    });
  });

  it('should dismiss all toasts', () => {
    const { result } = renderHook(() => useDelegationToast());

    act(() => {
      result.current.success('Toast 1');
      result.current.success('Toast 2');
      result.current.success('Toast 3');
    });

    act(() => {
      result.current.dismissAll();
    });
  });
});

describe('Accessibility hooks', () => {
  describe('useAriaAnnounce', () => {
    it('should announce message', async () => {
      const { result } = renderHook(() => useAriaAnnounce());

      act(() => {
        result.current.announce('Test announcement', 'polite');
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Test announcement');
        expect(result.current.politeness).toBe('polite');
      });
    });

    it('should auto-clear message after timeout', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useAriaAnnounce());

      act(() => {
        result.current.announce('Test', 'polite');
      });

      expect(result.current.message).toBe('Test');

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('');
      });

      jest.useRealTimers();
    });
  });

  describe('useKeyboardNavigation', () => {
    it('should detect Tab key press', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(result.current).toBe(false);

      const event = new KeyboardEvent('keydown', { key: 'Tab' });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(result.current).toBe(true);
    });

    it('should reset on mouse interaction', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      act(() => {
        window.dispatchEvent(tabEvent);
      });

      expect(result.current).toBe(true);

      const mouseEvent = new MouseEvent('mousedown');
      act(() => {
        window.dispatchEvent(mouseEvent);
      });

      expect(result.current).toBe(false);
    });
  });
});

// Tests d'intégration
describe('Integration tests', () => {
  it('should handle complete user workflow', async () => {
    const { result: prefsResult } = renderHook(() => useUserPreferences());
    const { result: toastResult } = renderHook(() => useDelegationToast());
    const { result: hotkeyResult } = renderHook(() => {
      const { preferences, setAutoRefresh } = useUserPreferences();
      const toast = useDelegationToast();

      useHotkeys('ctrl+p', () => {
        const newValue = !preferences.autoRefresh;
        setAutoRefresh(newValue);
        toast.success(
          'Préférences',
          `Auto-refresh ${newValue ? 'activé' : 'désactivé'}`
        );
      });

      return { preferences, setAutoRefresh, toast };
    });

    // Simulate Ctrl+P
    const event = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(hotkeyResult.current.preferences.autoRefresh).toBe(false);
    });
  });
});

export {};

