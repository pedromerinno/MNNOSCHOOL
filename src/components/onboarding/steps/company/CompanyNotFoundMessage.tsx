
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const CompanyNotFoundMessage: React.FC = () => {
  return (
    <div className="mt-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-4">
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle className="h-6 w-6 text-amber-600" strokeWidth={2} />
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-amber-900 mb-2">Empresa não encontrada</h3>
        <p className="text-sm text-amber-800 leading-relaxed">
          Não encontramos nenhuma empresa com este ID ou nome. Verifique se o código está correto ou crie uma nova empresa.
        </p>
      </div>
    </div>
  );
};

export default CompanyNotFoundMessage;
