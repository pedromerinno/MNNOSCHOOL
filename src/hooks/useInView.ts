import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook para detectar quando um elemento entra na viewport
 * 
 * @example
 * ```tsx
 * const { ref, inView } = useInView({ threshold: 0.1 });
 * 
 * return <div ref={ref}>
 *   {inView && <AnimatedContent />}
 * </div>
 * ```
 */
export const useInView = (options: UseInViewOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
  } = options;

  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, inView };
};

