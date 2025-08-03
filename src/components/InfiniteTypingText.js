/**
 * @file src/components/InfiniteTypingText.js
 * @description A React component that uses `TypingText` to create an infinite, in-view activated typing effect.
 * It restarts the typing animation whenever the component comes into the viewport.
 */

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import TypingText from './TypingText';

/**
 * `InfiniteTypingText` component.
 * Applies a typewriter effect to text that restarts when the component enters the viewport.
 * @param {object} props - The component props.
 * @param {string} props.text - The text string to be displayed with the typing effect. (Required)
 * @param {number} [props.speed] - The speed of typing in milliseconds per character. Passed to `TypingText`.
 * @param {string} [props.fontSize] - Custom font size for the displayed text. Passed to `TypingText`.
 * @returns {JSX.Element} A span element containing the `TypingText` component, which animates when in view.
 */
function InfiniteTypingText({ text, speed, fontSize, texts }) {
  // Support both 'text' and 'texts' props. If 'texts' is provided and is an array, use the first item.
  const displayText = Array.isArray(texts) && texts.length > 0 ? texts[0] : (text || '');
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const [typingKey, setTypingKey] = useState(0);

  useEffect(() => {
    if (inView) {
      setTypingKey(prev => prev + 1);
    }
  }, [inView]);

  return (
    <span ref={ref} style={{ display: 'inline-block', fontSize }}>
      {inView ? <TypingText key={typingKey} text={displayText} speed={speed} fontSize={fontSize} /> : null}
    </span>
  );
}

export default InfiniteTypingText;
