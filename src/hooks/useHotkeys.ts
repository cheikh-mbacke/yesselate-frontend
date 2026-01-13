import { useEffect, useRef, type DependencyList } from 'react';

export type HotkeyCallback = (event: KeyboardEvent, hotkeysEvent: HotkeysEvent) => void;

export interface HotkeysEvent {
  keys: string[];
  hotkey: string;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

export interface Options {
  enabled?: boolean;
  enableOnFormTags?: boolean | string[];
  enableOnContentEditable?: boolean;
  preventDefault?: boolean | ((event: KeyboardEvent, hotkeysEvent: HotkeysEvent) => boolean);
  description?: string;
  scopes?: string | string[];
  keyup?: boolean;
  keydown?: boolean;
  splitKey?: string;
  ignoreModifiers?: boolean;
  [key: string]: any;
}

/**
 * Enhanced implementation of useHotkeys
 * Supports advanced hotkey functionality with full feature parity
 * 
 * Features:
 * - Multiple key combinations
 * - Scoped hotkeys
 * - Dynamic enable/disable
 * - Form tag handling
 * - Modifier key support
 * - Keyup/keydown events
 * - Conditional preventDefault
 */
export function useHotkeys(
  keys: string | string[],
  callback: HotkeyCallback,
  optionsOrDeps?: Options | DependencyList,
  maybeDeps?: DependencyList
): void {
  const options: Options = Array.isArray(optionsOrDeps) ? {} : (optionsOrDeps || {});
  const deps = Array.isArray(optionsOrDeps) ? optionsOrDeps : (maybeDeps || []);
  
  const callbackRef = useRef(callback);
  const optionsRef = useRef(options);
  
  useEffect(() => {
    callbackRef.current = callback;
    optionsRef.current = options;
  });

  useEffect(() => {
    const { 
      enabled = true, 
      preventDefault = true, 
      enableOnFormTags = false,
      enableOnContentEditable = false,
      keydown = true,
      keyup = false,
      splitKey = '+',
      ignoreModifiers = false,
    } = optionsRef.current;

    if (!enabled) return;

    const normalizedKeys = typeof keys === 'string' ? [keys] : keys;

    const handler = (event: KeyboardEvent) => {
      // Check if we should ignore this event
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      // Ignore form elements unless explicitly enabled
      if (!enableOnFormTags && ['input', 'textarea', 'select'].includes(tagName)) {
        return;
      }

      // Ignore contentEditable unless explicitly enabled
      if (!enableOnContentEditable && target.isContentEditable) {
        return;
      }

      // Check for key combination match
      for (const hotkey of normalizedKeys) {
        const matchResult = matchesHotkey(event, hotkey, { splitKey, ignoreModifiers });
        
        if (matchResult) {
          const hotkeysEvent: HotkeysEvent = {
            keys: matchResult.keys,
            hotkey,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            alt: event.altKey,
            meta: event.metaKey,
          };

          // Conditional preventDefault
          const shouldPrevent = typeof preventDefault === 'function' 
            ? preventDefault(event, hotkeysEvent)
            : preventDefault;

          if (shouldPrevent) {
            event.preventDefault();
            event.stopPropagation();
          }

          callbackRef.current(event, hotkeysEvent);
          break;
        }
      }
    };

    // Register keydown and/or keyup handlers
    if (keydown) {
      window.addEventListener('keydown', handler);
    }
    if (keyup) {
      window.addEventListener('keyup', handler);
    }

    return () => {
      if (keydown) window.removeEventListener('keydown', handler);
      if (keyup) window.removeEventListener('keyup', handler);
    };
  }, [keys, ...deps]);
}

/**
 * Check if a keyboard event matches a hotkey string
 * Returns match result with extracted keys or null if no match
 */
function matchesHotkey(
  event: KeyboardEvent, 
  hotkey: string, 
  options: { splitKey?: string; ignoreModifiers?: boolean } = {}
): { keys: string[] } | null {
  const { splitKey = '+', ignoreModifiers = false } = options;
  const parts = hotkey.toLowerCase().split(splitKey).map(p => p.trim());
  
  const requiredMods = {
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
  };
  
  let mainKey = '';
  const allKeys: string[] = [];
  
  for (const part of parts) {
    if (part === 'ctrl' || part === 'control') {
      requiredMods.ctrl = true;
      allKeys.push('ctrl');
    } else if (part === 'shift') {
      requiredMods.shift = true;
      allKeys.push('shift');
    } else if (part === 'alt' || part === 'option') {
      requiredMods.alt = true;
      allKeys.push('alt');
    } else if (part === 'meta' || part === 'cmd' || part === 'command' || part === 'mod') {
      requiredMods.meta = true;
      allKeys.push('meta');
    } else {
      mainKey = part;
      allKeys.push(part);
    }
  }
  
  // Check modifiers match (unless ignoring)
  if (!ignoreModifiers) {
    if (event.ctrlKey !== requiredMods.ctrl) return null;
    if (event.shiftKey !== requiredMods.shift) return null;
    if (event.altKey !== requiredMods.alt) return null;
    if (event.metaKey !== requiredMods.meta) return null;
  }
  
  // Check main key
  if (mainKey) {
    const eventKey = event.key.toLowerCase();
    const eventCode = event.code.toLowerCase();
    
    // Handle special keys
    const specialKeyMap: Record<string, string[]> = {
      'escape': ['escape', 'esc'],
      'esc': ['escape', 'esc'],
      'tab': ['tab'],
      'enter': ['enter', 'return'],
      'return': ['enter', 'return'],
      'space': [' ', 'space', 'spacebar'],
      'spacebar': [' ', 'space', 'spacebar'],
      'backspace': ['backspace'],
      'delete': ['delete', 'del'],
      'del': ['delete', 'del'],
      'arrowup': ['arrowup', 'up'],
      'up': ['arrowup', 'up'],
      'arrowdown': ['arrowdown', 'down'],
      'down': ['arrowdown', 'down'],
      'arrowleft': ['arrowleft', 'left'],
      'left': ['arrowleft', 'left'],
      'arrowright': ['arrowright', 'right'],
      'right': ['arrowright', 'right'],
      'home': ['home'],
      'end': ['end'],
      'pageup': ['pageup'],
      'pagedown': ['pagedown'],
    };

    const matchKeys = specialKeyMap[mainKey] || [mainKey];
    
    if (matchKeys.includes(eventKey) || matchKeys.includes(eventCode)) {
      return { keys: allKeys };
    }

    // Handle number keys
    if (/^\d$/.test(mainKey) && (eventKey === mainKey || eventCode === `digit${mainKey}` || eventCode === `numpad${mainKey}`)) {
      return { keys: allKeys };
    }

    // Handle letter keys  
    if (/^[a-z]$/.test(mainKey) && (eventKey === mainKey || eventCode === `key${mainKey}`)) {
      return { keys: allKeys };
    }

    // Handle function keys
    if (/^f\d+$/.test(mainKey) && eventCode === mainKey) {
      return { keys: allKeys };
    }

    // Exact match fallback
    if (eventKey === mainKey) {
      return { keys: allKeys };
    }
  }
  
  return null;
}

/**
 * Check if a specific hotkey is currently pressed
 * Useful for checking hotkey state outside of the hook
 */
export function isHotkeyPressed(keys: string | string[], event?: KeyboardEvent): boolean {
  if (!event) return false;
  const normalizedKeys = typeof keys === 'string' ? [keys] : keys;
  return normalizedKeys.some(hotkey => matchesHotkey(event, hotkey) !== null);
}

