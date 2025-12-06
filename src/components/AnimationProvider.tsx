'use client';

import { useEffect } from 'react';

/**
 * Global Animation Provider
 * Automatically applies IntersectionObserver to all elements with data-animate-on-visible attribute
 */
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize IntersectionObserver for viewport-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px', // Trigger slightly before element enters viewport
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          // Get the animation type from data attribute
          const animationType = element.getAttribute('data-animate-on-visible');
          if (animationType && !element.classList.contains('animate-on-visible')) {
            // Add the animation class to trigger the CSS animation
            element.classList.add('animate-on-visible', animationType);
          }
        }
      });
    }, observerOptions);

    // Function to observe elements
    const observeElements = () => {
      // Observe all elements with data-animate-on-visible attribute
      const animatedElements = document.querySelectorAll('[data-animate-on-visible]');
      animatedElements.forEach((el) => {
        const element = el as HTMLElement;
        // Ensure element starts with opacity 0
        if (!element.classList.contains('animate-on-visible')) {
          element.style.opacity = '0';
          observer.observe(element);
        }
      });
    };

    // Initial observation
    observeElements();

    // Also observe dynamically added elements
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return <>{children}</>;
}

