import React from "react";
import { Input } from "@/components/ui/input";

interface CompanyDetails {
  name: string;
  description: string;
  historia: string;
  missao: string;
  valores: string;
  frase_institucional: string;
  video_institucional: string;
  descricao_video: string;
  cor_principal: string;
}

interface NewCompanyFormProps {
  companyDetails: CompanyDetails;
  onCompanyDetailsChange: (details: CompanyDetails) => void;
}

const NewCompanyForm: React.FC<NewCompanyFormProps> = ({
  companyDetails,
  onCompanyDetailsChange,
}) => {
  const handleChange = (field: keyof CompanyDetails, value: string) => {
    onCompanyDetailsChange({
      ...companyDetails,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="companyName" className="text-sm text-gray-500">
          Nome da empresa*
        </label>
        <Input
          id="companyName"
          value={companyDetails.name}
          onChange={(e) => handleChange('name', e.target.value)}
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
          onChange={(e) => handleChange('historia', e.target.value)}
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
          onChange={(e) => handleChange('missao', e.target.value)}
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
          onChange={(e) => handleChange('valores', e.target.value)}
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
          onChange={(e) => handleChange('frase_institucional', e.target.value)}
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
          onChange={(e) => handleChange('video_institucional', e.target.value)}
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
          onChange={(e) => handleChange('descricao_video', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[100px]"
          placeholder="Descreva o conteúdo do vídeo institucional"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="corPrincipal" className="text-sm text-gray-500">
          Cor principal
        </label>
        <Input
          id="corPrincipal"
          type="color"
          value={companyDetails.cor_principal || "#000000"}
          onChange={(e) => handleChange('cor_principal', e.target.value)}
          className="h-12 w-full cursor-pointer"
        />
      </div>
    </div>
  );
};

export default NewCompanyForm;
