
import React, { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Sobre sua empresa</h2>
        <p className="text-gray-500 text-sm">
          Você faz parte de uma empresa existente ou deseja criar uma nova?
        </p>
      </div>
      
      <RadioGroup 
        value={companyType} 
        onValueChange={(value) => setCompanyType(value as 'existing' | 'new')}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="text-base">Faço parte de uma empresa existente</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="text-base">Desejo criar uma nova empresa</Label>
        </div>
      </RadioGroup>
      
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
          className="w-full rounded-md bg-merinno-dark hover:bg-black text-white"
        >
          Continuar
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
