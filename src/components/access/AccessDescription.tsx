
import React from 'react';

interface AccessDescriptionProps {
  companyName?: string;
}

export const AccessDescription = ({ companyName }: AccessDescriptionProps) => {
  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 mb-6">
      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
        Aqui estão todos os acessos às ferramentas e plataformas utilizadas pela empresa {companyName}. 
        Clique em um card para visualizar as informações completas.
      </p>
    </div>
  );
};
