
export interface UserProfile {
  id: string; 
  email: string | null;
  display_name: string | null;
  // is_admin e cargo_id foram removidos - agora estão em user_empresa
  // Para verificar admin, use user_empresa.is_admin com contexto de empresa
  // Para verificar cargo, use user_empresa.cargo_id com contexto de empresa
  super_admin?: boolean | null; // Global - acesso a tudo
  avatar?: string | null;
  primeiro_login?: boolean | null;
  created_at?: string | null;
  // Dados pessoais globais
  aniversario?: string | null; // Data de aniversário (pessoal, global)
  cidade?: string | null; // Cidade onde mora (pessoal, global)
  // Campos abaixo foram movidos para user_empresa (por empresa):
  // - tipo_contrato
  // - data_inicio
  // - manual_cultura_aceito
  // - nivel_colaborador
  // - cargo_id
  // - is_admin
  // Propriedade para nome do cargo (pode vir de user_empresa)
  roleName?: string | null;
}
