
import React from "react";
import { Input } from "@/components/ui/input";
import NewCompanyValuesField, { ValueItem } from "./NewCompanyValuesField";

interface CompanyDetails {
  name: string;
  logo?: string; // url do logo
  frase_institucional: string;
  cor_principal: string;
  missao: string;
  valores: ValueItem[];
  video_institucional: string;
  descricao_video: string;
  historia: string;
}

interface NewCompanyFormProps {
  companyDetails: CompanyDetails;
  onCompanyDetailsChange: (details: CompanyDetails) => void;
}

const NewCompanyForm: React.FC<NewCompanyFormProps> = ({
  companyDetails,
  onCompanyDetailsChange,
}) => {

  const handleChange = <K extends keyof CompanyDetails>(field: K, value: CompanyDetails[K]) => {
    onCompanyDetailsChange({
      ...companyDetails,
      [field]: value,
    });
  };

  // Inicializa valores como array se undefined
  React.useEffect(() => {
    if (!Array.isArray(companyDetails.valores)) {
      handleChange("valores", []);
    }
  }, []);

  return (
    <div className="space-y-5">

      {/* 1. Nome da Empresa */}
      <div className="space-y-1">
        <label htmlFor="companyName" className="text-sm text-gray-500">
          Nome da empresa*
        </label>
        <Input
          id="companyName"
          value={companyDetails.name}
          onChange={e => handleChange('name', e.target.value)}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="Digite o nome da empresa"
          required
        />
      </div>

      {/* 2. Logo da Empresa */}
      <div className="space-y-1">
        <label htmlFor="logo" className="text-sm text-gray-500">
          Logo da empresa
        </label>
        <Input
          id="logo"
          value={companyDetails.logo ?? ""}
          onChange={e => handleChange('logo', e.target.value)}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="https://exemplo.com/logo.png"
        />
        {companyDetails.logo && companyDetails.logo.trim() && (
          <img src={companyDetails.logo} alt="Logo preview" className="h-14 mt-2 rounded bg-gray-50 border object-contain max-w-[180px]" />
        )}
      </div>

      {/* 3. Frase Institucional */}
      <div className="space-y-1">
        <label htmlFor="fraseInstitucional" className="text-sm text-gray-500">Frase institucional</label>
        <Input
          id="fraseInstitucional"
          value={companyDetails.frase_institucional}
          onChange={e => handleChange('frase_institucional', e.target.value)}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="Digite a frase institucional da empresa"
        />
      </div>

      {/* 4. Cor da empresa */}
      <div className="space-y-1">
        <label htmlFor="corPrincipal" className="text-sm text-gray-500">Cor principal</label>
        <Input
          id="corPrincipal"
          type="color"
          value={companyDetails.cor_principal || "#000000"}
          onChange={e => handleChange('cor_principal', e.target.value)}
          className="h-12 w-full cursor-pointer border"
        />
      </div>

      {/* 5. Missão */}
      <div className="space-y-1">
        <label htmlFor="missao" className="text-sm text-gray-500">Missão</label>
        <textarea
          id="missao"
          value={companyDetails.missao}
          onChange={e => handleChange('missao', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[80px]"
          placeholder="Qual é a missão da sua empresa?"
        />
      </div>

      {/* 6. Valores (em tópicos dinâmicos) */}
      <NewCompanyValuesField
        values={Array.isArray(companyDetails.valores) ? companyDetails.valores : []}
        onChange={valores => handleChange("valores", valores)}
      />

      {/* 7. URL Vídeo Institucional */}
      <div className="space-y-1">
        <label htmlFor="videoInstitucional" className="text-sm text-gray-500">URL do vídeo institucional</label>
        <Input
          id="videoInstitucional"
          value={companyDetails.video_institucional}
          onChange={e => handleChange('video_institucional', e.target.value)}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="https://youtube.com/..."
        />
      </div>

      {/* 8. História da Empresa (opcional, por último) */}
      <div className="space-y-1">
        <label htmlFor="historia" className="text-sm text-gray-500">História da empresa <span className="text-gray-400">(opcional)</span></label>
        <textarea
          id="historia"
          value={companyDetails.historia}
          onChange={e => handleChange('historia', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[80px]"
          placeholder="Conte a história da sua empresa"
        />
      </div>
    </div>
  );
};

export default NewCompanyForm;

