
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

// Verificar se o elemento root existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h1>Erro: Elemento root não encontrado</h1><p>Por favor, recarregue a página.</p></div>';
  throw new Error('Root element not found');
}

console.log('[main.tsx] Starting application...');
console.log('[main.tsx] Root element found:', rootElement);

// Adicionar um fallback visual imediato
rootElement.innerHTML = '<div style="padding: 20px; font-family: sans-serif; text-align: center;"><p>Carregando...</p></div>';

try {
  const root = createRoot(rootElement);
  console.log('[main.tsx] Root created, rendering...');
  
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log('[main.tsx] Application rendered successfully');
} catch (error) {
  console.error('[main.tsx] Error rendering application:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; max-width: 600px; margin: 50px auto;">
      <h1 style="color: #dc2626;">Erro ao carregar a aplicação</h1>
      <p style="color: #6b7280;">Ocorreu um erro ao inicializar a aplicação.</p>
      <pre style="background: #f3f4f6; padding: 15px; border-radius: 5px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Recarregar Página
      </button>
    </div>
  `;
  throw error;
}
