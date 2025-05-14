
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isCreating, setIsCreating] = useState(false);
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
      
      // Create the company
      const { data: companyData, error: companyError } = await supabase
        .from('empresas')
        .insert([{
          nome: companyName,
          created_by: user.id
        }])
        .select()
        .single();
      
      if (companyError) throw companyError;
      
      console.log("Empresa criada:", companyData);
      
      // Associate user with company as admin
      const { error: relationError } = await supabase
        .from('user_empresa')
        .insert([{
          user_id: user.id,
          empresa_id: companyData.id,
          is_admin: true
        }]);
      
      if (relationError) throw relationError;
      
      // Dispatch event to update company relationships
      window.dispatchEvent(new CustomEvent('company-relation-changed'));
      
      toast.success(`Empresa "${companyName}" criada com sucesso!`);
      
      if (onComplete) {
        onComplete();
      }
      
      // Force reload to refresh company data
      window.location.reload();
      
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
        <div className="space-y-2">
          <label htmlFor="companyName" className="text-sm text-gray-500 font-medium">
            Nome da empresa
          </label>
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

        <Button 
          type="submit" 
          className="mt-8 bg-black hover:bg-black/90 text-white"
          disabled={isCreating}
        >
          {isCreating ? "Criando..." : "Criar empresa"}
        </Button>
      </form>
    </div>
  );
};

export default NewCompanyForm;
