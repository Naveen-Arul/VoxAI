import { useEffect, useRef, RefObject } from 'react';

interface UseAutoScrollOptions {
  /**
   * Threshold in pixels from bottom to consider "near bottom"
   * If user is within this distance, auto-scroll will engage
   */
  threshold?: number;
  
  /**
   * Scroll behavior: 'smooth' or 'auto'
   */
  behavior?: ScrollBehavior;
  
  /**
   * Enable/disable auto-scroll
   */
  enabled?: boolean;
}

/**
 * Custom hook for auto-scrolling chat containers
 * Automatically scrolls to bottom when new messages arrive
 * Respects user's scroll position - pauses if user scrolls up
 * Resumes auto-scroll when user scrolls back near bottom
 */
export function useAutoScroll<T extends HTMLElement>(
  containerRef: RefObject<T>,
  dependencies: any[],
  options: UseAutoScrollOptions = {}
) {
  const {
    threshold = 150,
    behavior = 'smooth',
    enabled = true,
  } = options;

  const isUserScrollingRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Check if container is scrolled near bottom
   */
  const isNearBottom = (element: HTMLElement): boolean => {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= threshold;
  };

  /**
   * Scroll to bottom of container
   */
  const scrollToBottom = (element: HTMLElement, scrollBehavior: ScrollBehavior = behavior) => {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: scrollBehavior,
    });
  };

  /**
   * Handle scroll event to detect user manual scrolling
   */
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    
    // Detect if user scrolled up (manual scroll)
    if (currentScrollTop < lastScrollTopRef.current) {
      isUserScrollingRef.current = true;
    }
    
    // If user scrolled near bottom, resume auto-scroll
    if (isNearBottom(container)) {
      isUserScrollingRef.current = false;
    }

    lastScrollTopRef.current = currentScrollTop;

    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Reset user scrolling flag after delay
    scrollTimeoutRef.current = setTimeout(() => {
      if (isNearBottom(container)) {
        isUserScrollingRef.current = false;
      }
    }, 150);
  };

  /**
   * Auto-scroll effect when dependencies change
   */
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // If user is not manually scrolling or is near bottom, scroll to bottom
    if (!isUserScrollingRef.current || isNearBottom(container)) {
      // Use requestAnimationFrame for smooth performance
      requestAnimationFrame(() => {
        scrollToBottom(container);
      });
    }
  }, dependencies);

  /**
   * Attach scroll listener
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Return utility functions
   */
  return {
    scrollToBottom: () => {
      const container = containerRef.current;
      if (container) {
        isUserScrollingRef.current = false;
        scrollToBottom(container, 'smooth');
      }
    },
    scrollToTop: () => {
      const container = containerRef.current;
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    isNearBottom: () => {
      const container = containerRef.current;
      return container ? isNearBottom(container) : false;
    },
  };
}
