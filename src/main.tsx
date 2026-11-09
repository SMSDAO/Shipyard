import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker for offline asset and request caching
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Shipyard service worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });
}

import { Web3Provider } from './providers/Web3Provider';

createRoot(document.getElementById('root')!).render(
  <Web3Provider>
    <App />
  </Web3Provider>
);
