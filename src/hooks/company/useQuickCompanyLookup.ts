
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

export function useQuickCompanyLookup() {
  const [companyInfo, setCompanyInfo] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    setCompanyInfo(null);

    if (!searchTerm || searchTerm.trim().length < 3) {
      setLoading(false);
      setCompanyInfo(null);
      return;
    }

    try {
      // Tenta buscar por ID primeiro (UUID tem 36 caracteres com hifens)
      const isUUID = searchTerm.length === 36 && searchTerm.includes('-');
      
      let query = supabase
        .from("empresas")
        .select("id, nome, logo");

      if (isUUID) {
        // Busca exata por ID
        query = query.eq("id", searchTerm);
      } else {
        // Busca por nome (case-insensitive)
        query = query.ilike("nome", `%${searchTerm}%`).limit(1);
      }

      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      if (data) setCompanyInfo(data as Company);
      else setCompanyInfo(null);
    } catch (e: any) {
      setError("Empresa não encontrada");
      setCompanyInfo(null);
    }
    setLoading(false);
  };

  return { companyInfo, loading, error, fetchCompany };
}
