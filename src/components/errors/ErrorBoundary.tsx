
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-lg shadow-lg bg-white dark:bg-gray-800 p-8 text-center">
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
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar a página
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Limpar cache e recarregar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
