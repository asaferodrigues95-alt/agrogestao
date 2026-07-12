import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from '@app/App';
import { ThemeProvider } from '@shared/contexts/ThemeContext';
import { ensureSettings } from '@data/repositories';
import './index.css';

// Registra o service worker gerado pelo vite-plugin-pwa (funcionamento offline + instalação).
registerSW({ immediate: true });

// Garante que exista configuração padrão assim que o app abre pela primeira vez.
ensureSettings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
