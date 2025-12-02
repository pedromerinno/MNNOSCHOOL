
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import App from './App.tsx'
import './index.css'

// Limpar flag RLS que pode estar bloqueando carregamento de dados
// Este flag foi usado anteriormente mas agora foi removido dos hooks
try {
  localStorage.removeItem('rls_error_detected');
} catch (error) {
  console.warn('Could not clear rls_error_detected flag:', error);
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
