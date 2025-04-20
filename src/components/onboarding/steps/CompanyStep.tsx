
import React, { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Building, Plus } from "lucide-react";

interface CompanyStepProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ onNext, onBack, onCompanyTypeSelect }) => {
  const { profileData, updateProfileData } = useOnboarding();
  const [companyType, setCompanyType] = useState<'existing' | 'new'>(
    profileData.companyId ? 'existing' : 'new'
  );
  const [companyId, setCompanyId] = useState(profileData.companyId || "");
  const [companyDetails, setCompanyDetails] = useState({
    name: profileData.newCompanyName || "",
    description: "",
    historia: "",
    missao: "",
    valores: "",
    frase_institucional: "",
    video_institucional: "",
    descricao_video: ""
  });
  const [error, setError] = useState("");

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (companyType === 'existing' && !companyId) {
      setError("Por favor, informe o ID da empresa");
      return;
    }

    if (companyType === 'new' && !companyDetails.name) {
      setError("Por favor, informe o nome da empresa");
      return;
    }
    
    updateProfileData({ 
      companyId: companyType === 'existing' ? companyId : null,
      newCompanyName: companyType === 'new' ? companyDetails.name : null,
      companyDetails: companyType === 'new' ? companyDetails : null
    });

    onCompanyTypeSelect(companyType === 'existing');
    onNext();
  };

  const handleCompanyTypeChange = (type: 'existing' | 'new') => {
    setCompanyType(type);
    setError("");
  };

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Sobre sua empresa</h2>
        <p className="text-gray-500 text-sm">
          Você faz parte de uma empresa existente ou deseja criar uma nova?
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        <button
          type="button"
          onClick={() => handleCompanyTypeChange('existing')}
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
          onClick={() => handleCompanyTypeChange('new')}
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
        {companyType === 'existing' ? (
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
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm text-gray-500">
                Nome da empresa*
              </label>
              <Input
                id="companyName"
                value={companyDetails.name}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, name: e.target.value }))}
                className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
                placeholder="Digite o nome da empresa"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="historia" className="text-sm text-gray-500">
                História
              </label>
              <textarea
                id="historia"
                value={companyDetails.historia}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, historia: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[100px]"
                placeholder="Conte a história da sua empresa"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="missao" className="text-sm text-gray-500">
                Missão
              </label>
              <textarea
                id="missao"
                value={companyDetails.missao}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, missao: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[100px]"
                placeholder="Qual é a missão da sua empresa?"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="valores" className="text-sm text-gray-500">
                Valores
              </label>
              <textarea
                id="valores"
                value={companyDetails.valores}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, valores: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[100px]"
                placeholder="Quais são os valores da sua empresa?"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="fraseInstitucional" className="text-sm text-gray-500">
                Frase Institucional
              </label>
              <Input
                id="fraseInstitucional"
                value={companyDetails.frase_institucional}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, frase_institucional: e.target.value }))}
                className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
                placeholder="Digite a frase institucional da empresa"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="videoInstitucional" className="text-sm text-gray-500">
                URL do Vídeo Institucional
              </label>
              <Input
                id="videoInstitucional"
                value={companyDetails.video_institucional}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, video_institucional: e.target.value }))}
                className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
                placeholder="Digite a URL do vídeo institucional"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="descricaoVideo" className="text-sm text-gray-500">
                Descrição do Vídeo
              </label>
              <textarea
                id="descricaoVideo"
                value={companyDetails.descricao_video}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, descricao_video: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[100px]"
                placeholder="Descreva o conteúdo do vídeo institucional"
              />
            </div>
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
