
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface CompanyFoundMessageProps {
  companyName: string;
  logoUrl?: string | null;
}

const CompanyFoundMessage: React.FC<CompanyFoundMessageProps> = ({
  companyName,
  logoUrl
}) => {
  return (
    <div className="mt-6 p-5 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-4">
      <div className="flex-shrink-0 mt-0.5">
        <CheckCircle className="h-6 w-6 text-green-600" strokeWidth={2} />
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-green-900 mb-2">Empresa encontrada!</h3>
        <div className="flex items-center gap-3 mb-3">
          {logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={logoUrl} 
                alt={`${companyName} logo`} 
                className="h-10 w-10 object-contain rounded-lg border border-green-200 bg-white p-1" 
              />
            </div>
          )}
          <p className="text-sm font-medium text-green-800">{companyName}</p>
        </div>
        <p className="text-xs text-green-700 leading-relaxed">
          Clique em &quot;Concluir&quot; para solicitar acesso a esta empresa.
        </p>
      </div>
    </div>
  );
};

export default CompanyFoundMessage;
