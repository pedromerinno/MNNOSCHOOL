
export interface UserProfile {
  id: string; 
  email: string | null;
  display_name: string | null;
  is_admin: boolean | null;
  super_admin?: boolean | null;
  avatar?: string | null;
  cargo_id?: string | null;
  primeiro_login?: boolean | null;
  created_at?: string | null;
  // Novas colunas adicionadas
  aniversario?: string | null; // Data de aniversário
  tipo_contrato?: 'CLT' | 'PJ' | 'Fornecedor' | null; // Tipo de contrato
  cidade?: string | null; // Cidade onde mora
  data_inicio?: string | null; // Data de início na empresa
  manual_cultura_aceito?: boolean | null; // Se aceitou o manual de cultura
  nivel_colaborador?: 'Junior' | 'Pleno' | 'Senior' | null; // Nível do colaborador
  // Propriedade para nome do cargo
  roleName?: string | null;
}
