import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Suppress WebSocket connection error in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (e: ErrorEvent) => {
    if (e.message.includes('WebSocket')) {
      e.stopImmediatePropagation();
    }
  });
}

reportWebVitals(); 