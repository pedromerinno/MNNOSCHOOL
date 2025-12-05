import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"

// Handler global para capturar erros de DOM que são geralmente inofensivos
// Especialmente erros de removeChild que podem ocorrer quando bibliotecas
// de terceiros (como Radix UI) tentam remover nós que já foram removidos
window.addEventListener('error', (event) => {
  // Suprimir erros de removeChild que são geralmente inofensivos
  const errorMessage = event.message || event.error?.message || '';
  if (
    errorMessage.includes('removeChild') ||
    errorMessage.includes('The node to be removed is not a child')
  ) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Erro de DOM suprimido (geralmente inofensivo):', errorMessage);
    return false;
  }
}, true);

// Handler para erros não capturados em Promises
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason?.toString() || '';
  if (
    errorMessage.includes('removeChild') ||
    errorMessage.includes('The node to be removed is not a child')
  ) {
    event.preventDefault();
    console.warn('Erro de Promise suprimido (geralmente inofensivo):', errorMessage);
    return false;
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
