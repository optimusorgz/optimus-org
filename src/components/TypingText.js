
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


const TypingText = ({ text, speed = 100, onTypingEnd }) => {
    const [displayed, setDisplayed] = useState('');
    const hasTypedRef = useRef(false);

    useEffect(() => {
        // Reset hasTypedRef when text changes
        hasTypedRef.current = false;
        setDisplayed('');
        const interval = setInterval(() => {
            setDisplayed((prev) => {
                if (prev.length < text.length) {
                    return prev + text.charAt(prev.length);
                } else {
                    return prev;
                }
            });
        }, speed);
        return () => {
            clearInterval(interval);
        };
    }, [text, speed]);

    useEffect(() => {
        if (displayed.length === text.length && !hasTypedRef.current) {
            hasTypedRef.current = true;
            if (onTypingEnd) onTypingEnd();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayed, text, onTypingEnd]);

    return (
        <span style={{ whiteSpace: 'pre-line' }}>
            {displayed}
            <span style={cursorStyle}>|</span>
        </span>
    );
};

TypingText.propTypes = {
    text: PropTypes.string.isRequired,
    speed: PropTypes.number,
    onTypingEnd: PropTypes.func,
};

export default TypingText;
