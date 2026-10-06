import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastProvider, TooltipProvider } from '@dtx/ui';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delay={300}>
      <ToastProvider><App /></ToastProvider>
    </TooltipProvider>
  </StrictMode>,
);
