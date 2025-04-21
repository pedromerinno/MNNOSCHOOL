
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface CompanyInfo {
  id: string;
  nome: string;
  logo?: string | null;
}

interface ExistingCompanyFormProps {
  companyId: string;
  onCompanyIdChange: (id: string) => void;
  onCompanyLookup?: (company: CompanyInfo | null, lookupPending: boolean) => void;
}

const ExistingCompanyForm: React.FC<ExistingCompanyFormProps> = ({
  companyId,
  onCompanyIdChange,
  onCompanyLookup,
}) => {
  const [lookupPending, setLookupPending] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Para debounce enquanto o usuário digita
  const handleInputChange = (value: string) => {
    onCompanyIdChange(value);
    
    if (onCompanyLookup) {
      // Notificar que uma busca está pendente
      onCompanyLookup(null, true);
      
      // Limpa timer anterior se houver
      if (debounceTimer) clearTimeout(debounceTimer);
      
      // Configura novo timer para buscar após um curto período de tempo
      if (value.length >= 10) {
        const timer = setTimeout(() => {
          handleBlur();
        }, 500);
        setDebounceTimer(timer);
      }
    }
  };

  // Para evitar buscas excessivas, debounce ao sair do campo (onBlur)
  const handleBlur = async () => {
    if (!onCompanyLookup) return;
    
    if (companyId.length < 10) {
      onCompanyLookup(null, false);
      return;
    }
    
    setLookupPending(true);
    try {
      const res = await fetchCompany(companyId);
      onCompanyLookup(res, false);
    } catch (error) {
      console.error("Error looking up company:", error);
      onCompanyLookup(null, false);
    } finally {
      setLookupPending(false);
    }
  };

  // Busca rápida pelo id preenchido
  const fetchCompany = async (id: string): Promise<CompanyInfo | null> => {
    if (!id || id.length < 10) return null;
    
    console.log("Fetching company with ID:", id);
    
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome, logo")
        .eq("id", id)
        .maybeSingle();
        
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Company data received:", data);
      return data as CompanyInfo;
    } catch (error) {
      console.error("Error fetching company:", error);
      return null;
    }
  };

  useEffect(() => {
    // Se já temos um ID válido ao montar o componente, buscar imediatamente
    if (companyId && companyId.length >= 10 && onCompanyLookup) {
      handleBlur();
    }
    
    return () => {
      // Limpa qualquer timer pendente ao desmontar
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  return (
    <div className="space-y-3">
      <label htmlFor="companyId" className="text-sm text-gray-500">
        ID da empresa
      </label>
      <Input
        id="companyId"
        value={companyId}
        onChange={e => handleInputChange(e.target.value)}
        onBlur={handleBlur}
        className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-black"
        placeholder="Digite o ID da empresa"
      />
    </div>
  );
};

export default ExistingCompanyForm;
