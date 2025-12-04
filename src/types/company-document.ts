
export type CompanyDocumentType = 
  | 'confidentiality_agreement'
  | 'company_policy'
  | 'employment_contract'
  | 'company_manual'
  | 'procedures'
  | 'training_materials'
  | 'other';

export const COMPANY_DOCUMENT_TYPE_LABELS: Record<CompanyDocumentType, string> = {
  confidentiality_agreement: 'Acordo de Confidencialidade',
  company_policy: 'Política da Empresa',
  employment_contract: 'Contrato de Trabalho',
  company_manual: 'Manual da Empresa',
  procedures: 'Procedimentos',
  training_materials: 'Materiais de Treinamento',
  other: 'Outros'
};

export interface CompanyDocument {
  id: string;
  company_id: string;
  name: string;
  file_path?: string;
  file_type?: string;
  thumbnail_path?: string;
  document_type: CompanyDocumentType;
  description?: string;
  link_url?: string;
  attachment_type: 'file' | 'link';
  created_by: string;
  created_at: string;
  updated_at: string;
  job_roles?: string[]; // Nomes dos cargos (para exibição)
  job_role_ids?: string[]; // IDs dos cargos (para edição)
  allowed_users?: string[]; // Nomes dos usuários (para exibição)
  allowed_user_ids?: string[]; // IDs dos usuários (para edição)
  can_access?: boolean;
}
