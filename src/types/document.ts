
export interface UserDocument {
  id: string;
  user_id: string;
  company_id: string;
  name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
  document_type: DocumentType;
  description?: string;
}

export type DocumentType = 
  | 'confidentiality_agreement'
  | 'company_policy'
  | 'employment_contract'
  | 'other';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  confidentiality_agreement: 'Acordo de Confidencialidade',
  company_policy: 'Políticas da Empresa',
  employment_contract: 'Contrato de Trabalho',
  other: 'Outro'
};
