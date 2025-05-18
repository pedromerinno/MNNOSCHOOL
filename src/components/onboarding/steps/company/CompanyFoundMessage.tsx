
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
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-medium text-green-800">Empresa encontrada!</h3>
        <div className="mt-2 flex items-center">
          {logoUrl && (
            <div className="mr-3">
              <img 
                src={logoUrl} 
                alt={`${companyName} logo`} 
                className="h-8 w-8 object-contain" 
              />
            </div>
          )}
          <p className="text-sm text-green-700">{companyName}</p>
        </div>
        <p className="mt-1 text-xs text-green-600">
          Clique em &quot;Concluir&quot; para solicitar acesso a esta empresa.
        </p>
      </div>
    </div>
  );
};

export default CompanyFoundMessage;
