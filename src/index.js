/**
 * @file index.js
 * @description Entry point of the React application. Renders the root App component into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create a root and render the App component inside React.StrictMode for development checks.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
