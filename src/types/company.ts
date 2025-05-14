
export interface Company {
  id: string;
  nome: string;
  descricao?: string | null;
  responsavel?: string | null;
  logo?: string | null;
  historia?: string | null;
  missao?: string | null;
  valores?: string | null; // JSON string of values
  frase_institucional?: string | null;
  cor_principal?: string | null;
  video_institucional?: string | null;
  descricao_video?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

// Type for structured company values
export interface CompanyValue {
  title: string;
  description: string;
}
