
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import App from './App.tsx'
import './index.css'

// Global error handler para capturar erros não tratados
window.addEventListener('error', (event) => {
  console.error('[Global Error Handler]', event.error);
  const rootElement = document.getElementById("root");
  if (rootElement && !rootElement.querySelector('.error-display')) {
    rootElement.innerHTML = `
      <div class="error-display" style="padding: 20px; font-family: sans-serif; max-width: 600px; margin: 50px auto;">
        <h1 style="color: #dc2626;">Erro ao carregar a aplicação</h1>
        <p style="color: #6b7280;">Ocorreu um erro não tratado: ${event.error?.message || 'Erro desconhecido'}</p>
        <pre style="background: #f3f4f6; padding: 15px; border-radius: 5px; overflow: auto; font-size: 12px;">${event.error?.stack || String(event.error)}</pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recarregar Página
        </button>
      </div>
    `;
  }
});

// Handler para promises rejeitadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

// Limpar flag RLS que pode estar bloqueando carregamento de dados
try {
  localStorage.removeItem('rls_error_detected');
} catch (error) {
  // Silenciar erro se localStorage não estiver disponível
}

// Verificar se o elemento root existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  const errorMsg = 'Root element not found!';
  console.error('[main.tsx]', errorMsg);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: #dc2626;">Erro: Elemento root não encontrado</h1>
      <p>Por favor, recarregue a página.</p>
    </div>
  `;
  throw new Error(errorMsg);
}

// Adicionar um fallback visual imediato
rootElement.innerHTML = '<div style="padding: 20px; font-family: sans-serif; text-align: center;"><p>Carregando...</p></div>';

try {
  const root = createRoot(rootElement);
  
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (error) {
  console.error('[main.tsx] Error rendering application:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; max-width: 600px; margin: 50px auto;">
      <h1 style="color: #dc2626;">Erro ao carregar a aplicação</h1>
      <p style="color: #6b7280;">Ocorreu um erro ao inicializar a aplicação.</p>
      <pre style="background: #f3f4f6; padding: 15px; border-radius: 5px; overflow: auto; font-size: 12px; max-height: 300px;">${errorMessage}\n\n${errorStack}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Recarregar Página
      </button>
    </div>
  `;
  throw error;
}
