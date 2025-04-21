
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: prev.retryCount + 1
    }));
  };

  private handleClearAndRetry = () => {
    // Clear all localStorage items related to application state
    localStorage.removeItem('userCompanies');
    localStorage.removeItem('selectedCompany');
    localStorage.removeItem('selectedCompanyId');
    
    // Clear cached notices
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('notices_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reload the page to start fresh
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Se um fallback personalizado foi fornecido, use-o
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderização padrão de erro
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-lg shadow-lg bg-white dark:bg-gray-800 p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
              Ops! Algo deu errado
            </h1>
            
            <div className="text-gray-700 dark:text-gray-300 mb-6">
              <p className="mb-2">
                Encontramos um problema ao carregar a aplicação.
              </p>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Erro: {this.state.error?.message || "Erro desconhecido"}
              </p>
              
              {this.state.retryCount > 1 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md mb-4 text-sm text-amber-700 dark:text-amber-300">
                  <p>Várias tentativas de recuperação falharam. Tente limpar o cache da aplicação.</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                onClick={this.handleRetry}
                className="flex items-center gap-2"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
              
              <Button 
                onClick={this.handleClearAndRetry}
                className="flex items-center gap-2"
              >
                Limpar cache e recarregar
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Ir para início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
