import React from "react";
import { Building2, Link2, Plus, ArrowRight } from "lucide-react";

interface CompanyTypeSelectionProps {
  onTypeSelect: (type: 'new' | 'existing') => void;
  onSwitchToInfo?: () => void;
}

export const CompanyTypeSelection: React.FC<CompanyTypeSelectionProps> = ({
  onTypeSelect,
  onSwitchToInfo
}) => {
  const handleTypeSelect = (type: 'new' | 'existing') => {
    onTypeSelect(type);
    // Trocar automaticamente para a seção de informações quando qualquer tipo for selecionado
    if (onSwitchToInfo) {
      onSwitchToInfo();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Escolha o tipo de empresa
        </h2>
        <p className="text-gray-500 text-sm">
          Selecione entre criar uma nova empresa ou vincular-se a uma existente
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Create new company option */}
        <button
          onClick={() => handleTypeSelect('new')}
          className="group relative border-2 border-gray-200 rounded-xl p-6 text-left hover:border-gray-900 transition-all duration-200 flex flex-col items-start hover:shadow-lg bg-white"
        >
          <div className="mb-4 p-3 bg-gray-100 group-hover:bg-gray-900 rounded-xl transition-colors duration-200">
            <Plus className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors duration-200" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-gray-900">
            Nova Empresa
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Crie uma nova empresa no sistema e configure todas as informações
          </p>
          <div className="mt-5 flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
            <span>Começar</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Existing company option */}
        <button
          onClick={() => handleTypeSelect('existing')}
          className="group relative border-2 border-gray-200 rounded-xl p-6 text-left hover:border-gray-900 transition-all duration-200 flex flex-col items-start hover:shadow-lg bg-white"
        >
          <div className="mb-4 p-3 bg-gray-100 group-hover:bg-gray-900 rounded-xl transition-colors duration-200">
            <Link2 className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors duration-200" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-gray-900">
            Empresa Existente
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vincule-se a uma empresa já registrada no sistema usando o nome ou ID
          </p>
          <div className="mt-5 flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
            <span>Vincular</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};

