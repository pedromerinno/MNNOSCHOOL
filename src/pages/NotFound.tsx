
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">Página não encontrada</p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
