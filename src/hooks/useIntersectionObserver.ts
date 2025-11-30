import { useEffect, useRef } from 'react';

export interface UseIntersectionOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIntersection(
  element: HTMLElement | null,
  callback: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionOptions = {},
) {
  const callbackRef = useRef(callback);

  // 항상 최신 callback 참조 유지
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          callbackRef.current(entry);
        });
      },
      {
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, options.rootMargin, options.threshold]);
}

