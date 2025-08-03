
/**
 * @file src/components/TypingText.js
 * @description A React component that simulates a typewriter effect for a given text string.
 * It displays text character by character at a specified speed and can highlight a specific word.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Defines the inline style for the blinking cursor.
 * @type {React.CSSProperties}
 */
const cursorStyle = {
    display: 'inline-block',
    width: '1ch',
    color: '#00FFFF',
    fontWeight: 'bold',
    fontSize: '1.2em',
    marginLeft: '2px',
};

/**
 * `TypingText` component.
 * Displays text with a typewriter effect.
 * @param {object} props - The component props.
 * @param {string} props.text - The text string to be displayed with the typing effect. (Required)
 * @param {number} [props.speed=100] - The speed of typing in milliseconds per character. Defaults to 100ms.
 * @param {Function} [props.onTypingEnd] - Callback function to be called when the typing effect completes.
 * @param {string} [props.fontSize] - Custom font size for the displayed text. Defaults to '2.5em'.
 * @returns {JSX.Element} A span element containing the progressively typed text and a blinking cursor.
 */
const TypingText = ({ text, speed = 100, onTypingEnd, fontSize }) => {
    // State to hold the currently displayed text
    const [displayed, setDisplayed] = useState('');

    // Effect hook to handle the typing animation
    useEffect(() => {
        setDisplayed(''); // Reset displayed text on `text` or `speed` change
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(prev => {
                if (prev.length < text.length) {
                    return text.slice(0, prev.length + 1); // Add one more character
                } else {
                    clearInterval(interval); // Stop typing when text is fully displayed
                    if (onTypingEnd) {
                        onTypingEnd(); // Call callback if provided
                    }
                    return prev;
                }
            });
        }, speed);

        // Cleanup function to clear the interval on component unmount or dependency change
        return () => clearInterval(interval);
    }, [text, speed, onTypingEnd]); // Dependencies: re-run effect if text, speed, or onTypingEnd changes

    // Define the word to be highlighted
    const highlightWord = 'revolution';
    let content;

    // Check if the displayed text includes the highlight word and split it for styling
    if (displayed.includes(highlightWord)) {
        const parts = displayed.split(new RegExp(`(${highlightWord})`, 'i'));
        content = parts.map((part, idx) =>
            part.toLowerCase() === highlightWord.toLowerCase()
                ? <span key={idx} style={{ color: '#00FFFF', fontWeight: 700 }}>{part}</span>
                : <span key={idx}>{part}</span>
        );
    } else {
        content = displayed;
    }

    return (
        <span
            style={{
                whiteSpace: 'pre-line',
                fontWeight: 700,
                fontSize: fontSize || '2.5em',
                color: '#fff',
                fontFamily: 'Montserrat, Arial, Helvetica, sans-serif',
                letterSpacing: '0.5px',
            }}
        >
            {content}
            {/* Blinking cursor */}
            <span style={cursorStyle}>|</span>
        </span>
    );
};

/**
 * PropTypes for the TypingText component to ensure type-checking and validation.
 */
TypingText.propTypes = {
    text: PropTypes.string.isRequired,
    speed: PropTypes.number,
    onTypingEnd: PropTypes.func,
    fontSize: PropTypes.string,
};

export default TypingText;
