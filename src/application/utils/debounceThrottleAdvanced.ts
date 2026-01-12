/**
 * Advanced Debounce and Throttle Utilities
 * Versions avancées de debounce et throttle
 */

/**
 * Debounce avec options avancées
 */
export function advancedDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true, maxWait } = options || {};
  
  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;

  const invokeFunc = (time: number) => {
    const args = lastArgs || ([] as any);
    lastArgs = null;
    lastInvokeTime = time;
    result = func(...args);
    return result;
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time: number) => {
    timeoutId = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    return result;
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = null;
    timeoutId = null;
    maxTimeoutId = null;
  };

  const flush = () => {
    return timeoutId === null ? result : trailingEdge(Date.now());
  };

  const debounced = function(this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(time);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait);
        maxTimeoutId = setTimeout(() => {
          if (Date.now() - lastInvokeTime >= maxWait) {
            return trailingEdge(Date.now());
          }
        }, maxWait);
        return leading ? invokeFunc(time) : result;
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait);
    }
    return result;
  } as T & { cancel: () => void; flush: () => void };

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
}

/**
 * Throttle avec options avancées
 */
export function advancedThrottle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
): T & { cancel: () => void } {
  const { leading = true, trailing = true } = options || {};
  
  let timeoutId: NodeJS.Timeout | null = null;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;

  const invokeFunc = (time: number) => {
    const args = lastArgs || ([] as any);
    lastArgs = null;
    lastInvokeTime = time;
    result = func(...args);
    return result;
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastInvoke;
    return timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastInvoke = time - lastInvokeTime;
    return lastInvokeTime === 0 || timeSinceLastInvoke >= wait;
  };

  const timerExpired = () => {
    const time = Date.now();
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    timeoutId = null;
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    timeoutId = null;
  };

  const throttled = function(this: any, ...args: Parameters<T>) {
    const time = Date.now();

    lastArgs = args;

    if (shouldInvoke(time)) {
      if (timeoutId === null) {
        return leadingEdge(time);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, remainingWait(time));
    }
    return result;
  } as T & { cancel: () => void };

  throttled.cancel = cancel;

  return throttled;
}

/**
 * Debounce avec immédiat
 */
export function debounceImmediate<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  return advancedDebounce(func, wait, { leading: true, trailing: false }) as T;
}

/**
 * Throttle avec immédiat
 */
export function throttleImmediate<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  return advancedThrottle(func, wait, { leading: true, trailing: false }) as T;
}

