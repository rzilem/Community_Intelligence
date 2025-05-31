
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 Main.tsx: Starting application...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Main.tsx: Root element not found');
  throw new Error("Root element not found");
}

console.log('✅ Main.tsx: Root element found, creating React root...');

const root = createRoot(rootElement);

// Add global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Main.tsx: Unhandled promise rejection:', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('🔥 Main.tsx: Global error:', event.error);
});

console.log('✅ Main.tsx: Rendering App component...');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ Main.tsx: App component rendered successfully');
