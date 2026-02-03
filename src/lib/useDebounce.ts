import { useRef, useCallback, useEffect } from "react";

/**
 * Returns a debounced version of the callback that won't fire more than once per delay.
 * The callback is delayed until after `delay` milliseconds have elapsed since the last call.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 1000ms)
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number = 1000
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes (avoids stale closure)
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Returns a throttled version of the callback that fires at most once per interval.
 * Unlike debounce, this fires immediately on the first call, then ignores subsequent
 * calls until the interval has passed.
 *
 * @param callback - The function to throttle
 * @param interval - Minimum time between calls in milliseconds (default: 1000ms)
 */
export function useThrottledCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  interval: number = 1000
): T {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= interval) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    },
    [interval]
  ) as T;

  return throttledCallback;
}
