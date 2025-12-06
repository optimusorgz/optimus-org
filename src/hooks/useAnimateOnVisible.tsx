'use client';

import { useEffect, useRef, useState } from 'react';

interface UseAnimateOnVisibleOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook that triggers animation when element enters viewport
 * Usage: Add className "animate-on-visible fade-up" to element
 */
export function useAnimateOnVisible(options: UseAnimateOnVisibleOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already animated and triggerOnce is true, don't observe again
    if (hasAnimated && triggerOnce) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              setHasAnimated(true);
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasAnimated]);

  return { ref: elementRef, isVisible };
}

/**
 * Component wrapper that automatically applies animation classes
 */
export function AnimateOnVisible({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-in' | 'fade-in-scale' | 'fade-left' | 'fade-right' | 'slide-up' | 'slide-down' | 'pop-in' | 'blur-in';
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { ref, isVisible } = useAnimateOnVisible({ threshold, rootMargin, triggerOnce });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${className} ${isVisible ? `animate-on-visible ${animation}` : 'opacity-0'}`}
      style={{ animationDelay: `${delay}s` }}
      {...props}
    >
      {children}
    </div>
  );
}

