
import React from "react";
import { Building, Plus } from "lucide-react";

interface CompanyTypeSelectorProps {
  companyType: 'existing' | 'new';
  onTypeChange: (type: 'existing' | 'new') => void;
}

const CompanyTypeSelector: React.FC<CompanyTypeSelectorProps> = ({
  companyType,
  onTypeChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
      <button
        type="button"
        onClick={() => onTypeChange('existing')}
        className={`flex items-center p-6 border-2 rounded-xl transition-all ${
          companyType === 'existing'
            ? 'border-merinno-dark bg-gray-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className={`rounded-full p-2 mr-4 ${
          companyType === 'existing' 
            ? 'bg-merinno-dark text-white' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          <Building className="h-6 w-6" />
        </div>
        <div className="text-left">
          <h3 className="font-medium text-gray-900">Empresa Existente</h3>
          <p className="text-sm text-gray-500">
            Faço parte de uma empresa que já usa a plataforma
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onTypeChange('new')}
        className={`flex items-center p-6 border-2 rounded-xl transition-all ${
          companyType === 'new'
            ? 'border-merinno-dark bg-gray-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className={`rounded-full p-2 mr-4 ${
          companyType === 'new' 
            ? 'bg-merinno-dark text-white' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          <Plus className="h-6 w-6" />
        </div>
        <div className="text-left">
          <h3 className="font-medium text-gray-900">Nova Empresa</h3>
          <p className="text-sm text-gray-500">
            Quero criar uma nova empresa na plataforma
          </p>
        </div>
      </button>
    </div>
  );
};

export default CompanyTypeSelector;
