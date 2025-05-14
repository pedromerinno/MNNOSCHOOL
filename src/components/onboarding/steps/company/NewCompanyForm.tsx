
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import NewCompanyValuesField from "./NewCompanyValuesField";
import OnboardingLogoUploadField from "./OnboardingLogoUploadField";
import OnboardingColorPickerField from "./OnboardingColorPickerField";
import { CompanyValue } from "@/types/company";

interface NewCompanyFormProps {
  onBack?: () => void;
  onComplete?: () => void;
}

const NewCompanyForm: React.FC<NewCompanyFormProps> = ({ 
  onBack,
  onComplete
}) => {
  // Manage form value with refs instead of controlled inputs
  const companyNameRef = useRef<HTMLInputElement>(null);
  const companyMissionRef = useRef<HTMLTextAreaElement>(null);
  const companyHistoryRef = useRef<HTMLTextAreaElement>(null);
  const companyMottoRef = useRef<HTMLInputElement>(null);
  const companyVideoRef = useRef<HTMLInputElement>(null);
  const companyVideoDescRef = useRef<HTMLTextAreaElement>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyColor, setCompanyColor] = useState<string>("#1EAEDB");
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const companyName = companyNameRef.current?.value;
    
    if (!companyName || companyName.trim().length < 3) {
      toast.error("Nome da empresa deve ter pelo menos 3 caracteres");
      return;
    }
    
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }
    
    setIsCreating(true);
    
    try {
      console.log("Criando empresa:", companyName);
      
      // Convert companyValues array to a JSON string for storage
      const valoresString = companyValues.length > 0 ? JSON.stringify(companyValues) : null;
      
      // Create the company with only fields that exist in the table schema
      const { data: companyData, error: companyError } = await supabase
        .from('empresas')
        .insert({
          nome: companyName,
          missao: companyMissionRef.current?.value || null,
          historia: companyHistoryRef.current?.value || null,
          frase_institucional: companyMottoRef.current?.value || null,
          video_institucional: companyVideoRef.current?.value || null,
          descricao_video: companyVideoDescRef.current?.value || null,
          logo: logoUrl,
          cor_principal: companyColor,
          valores: valoresString,
          created_by: user.id
        })
        .select()
        .single();
      
      if (companyError) throw companyError;
      
      console.log("Empresa criada:", companyData);
      
      // Associate user with company as admin
      const { error: relationError } = await supabase
        .from('user_empresa')
        .insert({
          user_id: user.id,
          empresa_id: companyData.id,
          is_admin: true
        });
      
      if (relationError) throw relationError;
      
      // Dispatch event to update company relationships
      window.dispatchEvent(new CustomEvent('company-relation-changed'));
      
      toast.success(`Empresa "${companyName}" criada com sucesso!`);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error("Erro ao criar empresa:", error);
      toast.error(`Erro ao criar empresa: ${error.message}`);
    } finally {
      setIsCreating(false);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm text-gray-500 font-medium">
              Nome da empresa*
            </Label>
            <Input
              id="companyName"
              ref={companyNameRef}
              placeholder="Digite o nome da sua empresa"
              className="border border-gray-200 rounded-lg px-4 py-2 w-full"
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Digite o nome da sua empresa para criar um perfil
            </p>
          </div>
          
          <OnboardingLogoUploadField 
            value={logoUrl} 
            onChange={setLogoUrl} 
          />
          
          <OnboardingColorPickerField 
            value={companyColor} 
            onChange={setCompanyColor} 
          />
          
          <div className="space-y-2">
            <Label htmlFor="companyMotto" className="text-sm text-gray-500 font-medium">
              Frase institucional
            </Label>
            <Input
              id="companyMotto"
              ref={companyMottoRef}
              placeholder="Digite a frase institucional da empresa"
              className="border border-gray-200 rounded-lg px-4 py-2 w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyMission" className="text-sm text-gray-500 font-medium">
              Missão
            </Label>
            <Textarea
              id="companyMission"
              ref={companyMissionRef}
              placeholder="Qual é a missão da sua empresa"
              rows={3}
              className="border border-gray-200 rounded-lg px-4 py-2 w-full"
            />
          </div>
          
          <NewCompanyValuesField 
            values={companyValues} 
            onChange={setCompanyValues} 
          />
          
          <div className="space-y-2">
            <Label htmlFor="companyHistory" className="text-sm text-gray-500 font-medium">
              História
            </Label>
            <Textarea
              id="companyHistory"
              ref={companyHistoryRef}
              placeholder="Conte a história da sua empresa"
              rows={4}
              className="border border-gray-200 rounded-lg px-4 py-2 w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyVideo" className="text-sm text-gray-500 font-medium">
              Vídeo institucional (URL)
            </Label>
            <Input
              id="companyVideo"
              ref={companyVideoRef}
              placeholder="URL do vídeo institucional (YouTube, Vimeo, etc.)"
              className="border border-gray-200 rounded-lg px-4 py-2 w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyVideoDescription" className="text-sm text-gray-500 font-medium">
              Descrição do vídeo
            </Label>
            <Textarea
              id="companyVideoDescription"
              ref={companyVideoDescRef}
              placeholder="Descreva o conteúdo do vídeo institucional"
              rows={2}
              className="border border-gray-200 rounded-lg px-4 py-2 w-full"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            className="bg-black hover:bg-black/90 text-white"
            disabled={isCreating}
          >
            {isCreating ? "Criando..." : "Criar empresa"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewCompanyForm;
