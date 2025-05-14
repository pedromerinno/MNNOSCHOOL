
import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import NewCompanyValuesField, { ValueItem } from "./NewCompanyValuesField";
import OnboardingLogoUploadField from "./OnboardingLogoUploadField";
import OnboardingColorPickerField from "./OnboardingColorPickerField";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
  companyDetails?: CompanyDetails;
  onCompanyDetailsChange?: (details: CompanyDetails) => void;
  onBack?: () => void;
  onComplete?: () => void;
}

const NewCompanyForm: React.FC<NewCompanyFormProps> = ({
  companyDetails = {
    name: "",
    logo: "",
    frase_institucional: "",
    cor_principal: "#000000",
    missao: "",
    valores: [],
    video_institucional: "",
    descricao_video: "",
    historia: ""
  },
  onCompanyDetailsChange = () => {},
  onBack,
  onComplete,
}) => {
  // Referências para os campos de entrada
  const nameRef = useRef<HTMLInputElement>(null);
  const fraseRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const missaoRef = useRef<HTMLTextAreaElement>(null);
  const historiaRef = useRef<HTMLTextAreaElement>(null);
  
  // Estado local para valores
  const [companyData, setCompanyData] = React.useState(companyDetails);

  // Função para atualizar o estado local e propagar a mudança
  const handleChange = <K extends keyof CompanyDetails>(field: K, value: CompanyDetails[K]) => {
    const updatedData = {
      ...companyData,
      [field]: value,
    };
    setCompanyData(updatedData);
    onCompanyDetailsChange(updatedData);
  };

  // Inicializa o array de valores se necessário
  React.useEffect(() => {
    if (!Array.isArray(companyData.valores)) {
      handleChange("valores", []);
    }
  }, []);

  // Handler para o botão de complete
  const handleComplete = () => {
    if (!companyData.name.trim()) {
      toast.error("O nome da empresa é obrigatório");
      return;
    }
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-5">
      {/* Back button */}
      {onBack && (
        <Button 
          type="button" 
          variant="ghost"
          className="mb-4 flex items-center justify-center gap-2 text-gray-500"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      )}

      {/* 1. Nome da Empresa */}
      <div className="space-y-1">
        <label htmlFor="companyName" className="text-sm text-gray-500">
          Nome da empresa*
        </label>
        <Input
          id="companyName"
          ref={nameRef}
          defaultValue={companyData.name}
          onChange={() => nameRef.current && handleChange('name', nameRef.current.value)}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="Digite o nome da empresa"
          required
        />
      </div>

      {/* 2. Logo da Empresa - upload + url */}
      <div className="space-y-1">
        <label htmlFor="logo" className="text-sm text-gray-500">
          Logo da empresa
        </label>
        <OnboardingLogoUploadField
          value={companyData.logo ?? ""}
          onChange={url => handleChange('logo', url)}
          companyName={companyData.name}
        />
      </div>

      {/* 3. Frase Institucional */}
      <div className="space-y-1">
        <label htmlFor="fraseInstitucional" className="text-sm text-gray-500">Frase institucional</label>
        <Input
          id="fraseInstitucional"
          ref={fraseRef}
          defaultValue={companyData.frase_institucional}
          onChange={() => fraseRef.current && handleChange('frase_institucional', fraseRef.current.value)}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="Digite a frase institucional da empresa"
        />
      </div>

      {/* 4. Cor da empresa (color picker visual) */}
      <div className="space-y-1">
        <label htmlFor="corPrincipal" className="text-sm text-gray-500">Cor principal</label>
        <OnboardingColorPickerField
          value={companyData.cor_principal || "#000000"}
          onChange={color => handleChange("cor_principal", color)}
        />
      </div>

      {/* 5. Missão */}
      <div className="space-y-1">
        <label htmlFor="missao" className="text-sm text-gray-500">Missão</label>
        <textarea
          id="missao"
          ref={missaoRef}
          defaultValue={companyData.missao}
          onChange={() => missaoRef.current && handleChange('missao', missaoRef.current.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[80px]"
          placeholder="Qual é a missão da sua empresa?"
        />
      </div>

      {/* 6. Valores (tópicos dinâmicos igual ao admin) */}
      <NewCompanyValuesField
        values={Array.isArray(companyData.valores) ? companyData.valores : []}
        onChange={valores => handleChange("valores", valores)}
      />

      {/* 7. URL Vídeo Institucional */}
      <div className="space-y-1">
        <label htmlFor="videoInstitucional" className="text-sm text-gray-500">URL do vídeo institucional</label>
        <Input
          id="videoInstitucional"
          ref={videoRef}
          defaultValue={companyData.video_institucional}
          onChange={() => videoRef.current && handleChange('video_institucional', videoRef.current.value)}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="https://youtube.com/..."
        />
      </div>

      {/* 8. História da Empresa (opcional) */}
      <div className="space-y-1">
        <label htmlFor="historia" className="text-sm text-gray-500">História da empresa <span className="text-gray-400">(opcional)</span></label>
        <textarea
          id="historia"
          ref={historiaRef}
          defaultValue={companyData.historia}
          onChange={() => historiaRef.current && handleChange('historia', historiaRef.current.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark min-h-[80px]"
          placeholder="Conte a história da sua empresa"
        />
      </div>

      {/* Complete button */}
      {onComplete && (
        <Button 
          type="button" 
          className="w-full mt-8"
          onClick={handleComplete}
        >
          Concluir
        </Button>
      )}
    </div>
  );
};

export default NewCompanyForm;
