
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

export function useQuickCompanyLookup() {
  const [companyInfo, setCompanyInfo] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async (companyId: string) => {
    setLoading(true);
    setError(null);
    setCompanyInfo(null);

    if (!companyId || companyId.length < 10) {
      setLoading(false);
      setCompanyInfo(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome, logo")
        .eq("id", companyId)
        .maybeSingle();
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
