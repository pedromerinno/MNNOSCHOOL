import React from 'react';

interface DocumentsDescriptionProps {
  companyName?: string;
}

export const DocumentsDescription = ({ companyName }: DocumentsDescriptionProps) => {
  return (
    <div>
      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
        Gerencie todos os documentos da empresa <span className="font-semibold">{companyName}</span> e seus documentos pessoais. 
        Faça upload, visualize, baixe e organize seus arquivos de forma centralizada e segura.
      </p>
    </div>
  );
};



