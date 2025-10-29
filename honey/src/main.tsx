import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Temporarily disable StrictMode to get accurate ActionProvider construction count
// StrictMode intentionally double-mounts components in development
// Re-enable for production: wrap <App /> with <StrictMode>
createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
);
