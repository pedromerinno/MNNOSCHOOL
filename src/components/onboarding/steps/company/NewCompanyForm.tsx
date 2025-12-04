
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
  hideSubmitButton?: boolean;
}

const NewCompanyForm: React.FC<NewCompanyFormProps> = ({ 
  onBack,
  onComplete,
  hideSubmitButton = false
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
      
      // Associate user with company as admin - com retry e logs adicionais
      let relationCreated = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!relationCreated && retryCount < maxRetries) {
        try {
          console.log(`Tentativa ${retryCount + 1} de associar usuário ${user.id} à empresa ${companyData.id}`);
          const { error: relationError } = await supabase
            .from('user_empresa')
            .insert({
              user_id: user.id,
              empresa_id: companyData.id,
              is_admin: true // Garantindo que o usuário que criou a empresa seja admin
            });
          
          if (relationError) {
            console.error(`Erro na tentativa ${retryCount + 1}:`, relationError);
            retryCount++;
            if (retryCount < maxRetries) {
              // Espera um tempo antes de tentar novamente
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              throw relationError;
            }
          } else {
            relationCreated = true;
            console.log("Usuário associado com sucesso como admin da empresa");
          }
        } catch (err) {
          console.error("Erro ao associar usuário:", err);
          retryCount++;
          if (retryCount >= maxRetries) throw err;
        }
      }
      
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
    <div className="space-y-6">
      {/* Back button */}
      {onBack && (
        <Button 
          type="button" 
          variant="ghost"
          className="mb-2 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção: Informações Básicas */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Informações Básicas</h3>
            <p className="text-xs text-gray-500">Dados fundamentais da empresa</p>
          </div>
          
          <div className="space-y-5 pl-4 border-l-2 border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-semibold text-gray-900">
                Nome da empresa*
              </Label>
              <Input
                id="companyName"
                ref={companyNameRef}
                placeholder="Ex: Minha Empresa Ltda"
                className="h-10 border border-gray-200 rounded-lg"
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
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
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200"></div>

        {/* Seção: Identidade e Cultura */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Identidade e Cultura</h3>
            <p className="text-xs text-gray-500">Valores, missão e história da empresa</p>
          </div>
          
          <div className="space-y-5 pl-4 border-l-2 border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="companyMotto" className="text-sm font-semibold text-gray-900">
                Frase institucional
              </Label>
              <Input
                id="companyMotto"
                ref={companyMottoRef}
                placeholder="Ex: Construindo um futuro melhor"
                className="h-10 border border-gray-200 rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyMission" className="text-sm font-semibold text-gray-900">
                Missão
              </Label>
              <Textarea
                id="companyMission"
                ref={companyMissionRef}
                placeholder="Descreva a missão da sua empresa..."
                rows={4}
                className="resize-none border border-gray-200 rounded-lg"
              />
            </div>
            
            <NewCompanyValuesField 
              values={companyValues} 
              onChange={setCompanyValues} 
            />
            
            <div className="space-y-2">
              <Label htmlFor="companyHistory" className="text-sm font-semibold text-gray-900">
                História
              </Label>
              <Textarea
                id="companyHistory"
                ref={companyHistoryRef}
                placeholder="Conte a história da sua empresa..."
                rows={4}
                className="resize-none border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200"></div>

        {/* Seção: Vídeo Institucional */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Vídeo Institucional</h3>
            <p className="text-xs text-gray-500">Conteúdo em vídeo sobre a empresa</p>
          </div>
          
          <div className="space-y-5 pl-4 border-l-2 border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="companyVideo" className="text-sm font-semibold text-gray-900">
                Vídeo institucional (URL)
              </Label>
              <Input
                id="companyVideo"
                ref={companyVideoRef}
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                className="h-10 border border-gray-200 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL do vídeo institucional (YouTube, Vimeo, etc.)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyVideoDescription" className="text-sm font-semibold text-gray-900">
                Descrição do vídeo
              </Label>
              <Textarea
                id="companyVideoDescription"
                ref={companyVideoDescRef}
                placeholder="Descreva o conteúdo do vídeo institucional..."
                rows={3}
                className="resize-none border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Botão de submit */}
        {!hideSubmitButton && (
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button 
              type="submit" 
              className="min-w-[120px] bg-black hover:bg-black/90 text-white font-medium"
              disabled={isCreating}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Criando...
                </span>
              ) : (
                "Criar empresa"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewCompanyForm;
