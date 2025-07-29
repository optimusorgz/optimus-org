import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import TypingText from './TypingText';

// Helper for infinite typewriter effect
function InfiniteTypingText({ text, speed, fontSize }) {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const [typingKey, setTypingKey] = useState(0);
  useEffect(() => {
    if (inView) setTypingKey(prev => prev + 1);
  }, [inView]);
  return (
    <span ref={ref} style={{ display: 'inline-block', fontSize }}>
      {inView ? <TypingText key={typingKey} text={text} speed={speed} fontSize={fontSize} /> : null}
    </span>
  );
}

export default InfiniteTypingText;
