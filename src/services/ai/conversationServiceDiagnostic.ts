/**
 * Função de diagnóstico para testar se o usuário pode criar conversas
 * Use esta função apenas para debug
 */
import { supabase } from "@/integrations/supabase/client";

export async function diagnosticConversationCreation(userId: string, companyId: string) {
  console.log("=== DIAGNÓSTICO DE CRIAÇÃO DE CONVERSA ===");
  console.log("UserId:", userId);
  console.log("CompanyId:", companyId);
  
  // 1. Verificar se usuário está autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log("1. Usuário autenticado:", user?.id, "Erro:", authError);
  
  // 2. Verificar se usuário pertence à empresa
  const { data: userCompany, error: checkError } = await supabase
    .from("user_empresa")
    .select("user_id, empresa_id, is_admin")
    .eq("user_id", userId)
    .eq("empresa_id", companyId)
    .maybeSingle();
  
  console.log("2. Associação user_empresa:", userCompany, "Erro:", checkError);
  
  // 3. Verificar se a empresa existe
  const { data: company, error: companyError } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("id", companyId)
    .maybeSingle();
  
  console.log("3. Empresa existe:", company, "Erro:", companyError);
  
  // 4. Tentar criar conversa
  const { data: conversation, error: createError } = await supabase
    .from("ai_conversations")
    .insert([
      {
        user_id: userId,
        company_id: companyId,
        title: null,
      },
    ])
    .select()
    .single();
  
  console.log("4. Tentativa de criar conversa:", conversation, "Erro:", createError);
  
  // 5. Se criou, deletar para não deixar lixo
  if (conversation) {
    await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", conversation.id);
    console.log("5. Conversa de teste deletada");
  }
  
  console.log("=== FIM DO DIAGNÓSTICO ===");
  
  return {
    user,
    userCompany,
    company,
    conversation,
    errors: {
      authError,
      checkError,
      companyError,
      createError,
    },
  };
}

