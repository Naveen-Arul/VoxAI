import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "highlight.js/styles/github-dark.css";
import "./index.css";

// Suppress console warnings and errors for cleaner debugging
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = String(args[0] || '');
  if (
    msg.includes('React Router Future Flag') ||
    msg.includes('React DevTools') ||
    msg.includes('zybTrackerStatisticsAction') ||
    msg.includes('copilot.b68e6a51.js') ||
    msg.includes('PC plat undefined')
  ) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  const msg = String(args[0] || '');
  if (
    msg.includes('404 Error: User attempted to access non-existent route: /hybridaction') ||
    msg.includes('zybTrackerStatisticsAction') ||
    msg.includes('copilot.b68e6a51.js') ||
    msg.includes('PC plat undefined') ||
    msg.includes('v[b] is not a function')
  ) {
    return;
  }
  originalError(...args);
};

const originalLog = console.log;
console.log = (...args) => {
  const msg = String(args[0] || '');
  if (
    msg.includes('copilot.b68e6a51.js') ||
    msg.includes('PC plat undefined')
  ) {
    return;
  }
  originalLog(...args);
};

// Suppress window errors from browser extensions
window.addEventListener('error', (e) => {
  if (
    e.filename?.includes('copilot.b68e6a51.js') ||
    e.message?.includes('v[b] is not a function') ||
    e.message?.includes('PC plat undefined')
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
