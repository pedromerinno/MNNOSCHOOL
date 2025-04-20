
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import App from './App.tsx'
import './index.css'

// Error handler for global uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Create a container element if it doesn't exist
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found, creating a new one");
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
}

// Safe root rendering with error boundary
try {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (error) {
  console.error("Error during root rendering:", error);
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
      <h1 style="color: #e11d48;">Erro crítico na aplicação</h1>
      <p>Ocorreu um erro ao iniciar a aplicação. Por favor, recarregue a página.</p>
      <button style="margin-top: 16px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;" 
              onclick="window.location.reload()">
        Recarregar
      </button>
    </div>
  `;
}
