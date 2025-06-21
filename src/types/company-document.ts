
export interface CompanyDocument {
  id: string;
  company_id: string;
  name: string;
  file_path?: string;
  file_type?: string;
  document_type: CompanyDocumentType;
  description?: string;
  link_url?: string;
  attachment_type: 'file' | 'link';
  created_by: string;
  created_at: string;
  updated_at: string;
  // Para uso na interface
  job_roles?: string[];
  can_access?: boolean;
}

export type CompanyDocumentType = 
  | 'confidentiality_agreement'
  | 'company_policy'
  | 'employment_contract'
  | 'company_manual'
  | 'procedures'
  | 'forms'
  | 'training_materials'
  | 'other';

export const COMPANY_DOCUMENT_TYPE_LABELS: Record<CompanyDocumentType, string> = {
  confidentiality_agreement: 'Acordo de Confidencialidade',
  company_policy: 'Políticas da Empresa',
  employment_contract: 'Contrato de Trabalho',
  company_manual: 'Manual da Empresa',
  procedures: 'Procedimentos',
  forms: 'Formulários',
  training_materials: 'Material de Treinamento',
  other: 'Outro'
};

export interface CompanyDocumentJobRole {
  id: string;
  company_document_id: string;
  job_role_id: string;
  created_at: string;
}
