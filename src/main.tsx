
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import App from './App.tsx'
import './index.css'

// Simplificamos o render para garantir que não há problemas com o contexto dos hooks
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
