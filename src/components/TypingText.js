
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const cursorStyle = {
    display: 'inline-block',
    width: '1ch',
    color: '#00FFFF',
    fontWeight: 'bold',
    fontSize: '1.2em',
    marginLeft: '2px',
};


const TypingText = ({ text, speed = 100, onTypingEnd, fontSize }) => {
    const [displayed, setDisplayed] = useState('');
    const hasTypedRef = useRef(false);

    useEffect(() => {
        hasTypedRef.current = false;
        setDisplayed('');
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(prev => {
                if (prev.length < text.length) {
                    return text.slice(0, prev.length + 1);
                } else {
                    clearInterval(interval);
                    return prev;
                }
            });
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);
    // Highlight 'revolution' if present in the displayed text
    const highlightWord = 'revolution';
    let content;
    if (displayed.includes(highlightWord)) {
        const parts = displayed.split(new RegExp(`(${highlightWord})`, 'i'));
        content = parts.map((part, idx) =>
            part.toLowerCase() === highlightWord
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
            <span style={cursorStyle}>|</span>
        </span>
    );
};


TypingText.propTypes = {
    text: PropTypes.string.isRequired,
    speed: PropTypes.number,
    onTypingEnd: PropTypes.func,
    fontSize: PropTypes.string,
};

export default TypingText;
