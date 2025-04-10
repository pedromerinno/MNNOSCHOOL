
import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="py-4 text-center">
      <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
      <p className="text-sm text-gray-500 mt-2">Carregando vídeos...</p>
    </div>
  );
};
