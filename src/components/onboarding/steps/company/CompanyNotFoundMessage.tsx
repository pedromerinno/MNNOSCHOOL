
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const CompanyNotFoundMessage: React.FC = () => {
  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-medium text-amber-800">Empresa não encontrada</h3>
        <p className="mt-1 text-sm text-amber-700">
          Não encontramos nenhuma empresa com este ID. Verifique se o código está correto ou crie uma nova empresa.
        </p>
      </div>
    </div>
  );
};

export default CompanyNotFoundMessage;
