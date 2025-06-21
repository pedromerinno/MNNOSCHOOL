
export interface UserDocument {
  id: string;
  user_id: string;
  company_id: string;
  name: string;
  file_path?: string;
  file_type?: string;
  uploaded_at: string;
  uploaded_by: string;
  document_type: DocumentType;
  description?: string;
  link_url?: string;
  attachment_type: 'file' | 'link';
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

// Tipos expandidos para incluir novos tipos da empresa
export type ExtendedDocumentType = DocumentType 
  | 'company_manual'
  | 'procedures' 
  | 'forms'
  | 'training_materials';

export const EXTENDED_DOCUMENT_TYPE_LABELS: Record<ExtendedDocumentType, string> = {
  ...DOCUMENT_TYPE_LABELS,
  company_manual: 'Manual da Empresa',
  procedures: 'Procedimentos',
  forms: 'Formulários',
  training_materials: 'Material de Treinamento'
};
