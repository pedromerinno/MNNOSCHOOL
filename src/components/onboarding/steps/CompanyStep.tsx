
import React, { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Building, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CompanyStepProps {
  onNext: () => void;
  onBack: () => void;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ onNext, onBack }) => {
  const { profileData, updateProfileData } = useOnboarding();
  const [companyType, setCompanyType] = useState<'existing' | 'new'>(
    profileData.companyId ? 'existing' : 'new'
  );
  const [companyId, setCompanyId] = useState(profileData.companyId || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (companyType === 'existing' && !companyId) {
      setError("Por favor, informe o ID da empresa");
      return;
    }
    
    updateProfileData({ 
      companyId: companyType === 'existing' ? companyId : null,
      newCompanyName: companyType === 'new' ? 'new_company' : null
    });
    
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Sobre sua empresa</h2>
        <p className="text-gray-500 text-sm">
          Você faz parte de uma empresa existente ou deseja criar uma nova?
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        <button
          type="button"
          onClick={() => setCompanyType('existing')}
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
          onClick={() => setCompanyType('new')}
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
      
      <div className="pt-2">
        {companyType === 'existing' && (
          <div className="space-y-3">
            <label htmlFor="companyId" className="text-sm text-gray-500">
              ID da empresa
            </label>
            <Input
              id="companyId"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
              placeholder="Digite o ID da empresa"
            />
          </div>
        )}
      </div>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      <div className="pt-4 flex flex-col gap-3">
        <Button 
          type="submit" 
          className="w-full rounded-md bg-merinno-dark hover:bg-black text-white relative overflow-hidden transition-all duration-200 group"
        >
          Continuar
          <span className="absolute inset-0 h-full w-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost"
          className="flex items-center justify-center gap-2 text-gray-500 mt-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    </form>
  );
};

export default CompanyStep;
