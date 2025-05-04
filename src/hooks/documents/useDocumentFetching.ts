
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserDocument } from "@/types/document";

export const useDocumentFetching = () => {
  const fetchDocumentsForUser = useCallback(async (
    userId: string,
    companyId: string
  ): Promise<UserDocument[]> => {
    console.log(`Buscando documentos para usuário ${userId} na empresa ${companyId}`);
    
    if (!userId || !companyId) {
      console.error("ID do usuário ou da empresa não fornecido");
      return [];
    }

    try {
      // Verificar se o usuário é admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', userId)
        .single();
      
      const isAdmin = profileData?.is_admin || profileData?.super_admin;

      // Se for admin, buscar todos os documentos da empresa
      // Caso contrário, buscar apenas os documentos relacionados ao usuário
      const query = supabase
        .from('user_documents')
        .select('*');

      if (isAdmin) {
        query.eq('company_id', companyId);
      } else {
        // Usuário normal vê apenas seus próprios documentos
        query.eq('company_id', companyId)
            .eq('user_id', userId);
      }

      const { data, error } = await query.order('uploaded_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar documentos:", error);
        throw error;
      }

      return data as UserDocument[];
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      throw error;
    }
  }, []);

  return { fetchDocumentsForUser };
};
