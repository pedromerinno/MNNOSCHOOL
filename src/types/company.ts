
export interface Company {
  id: string;
  nome: string;
  missao?: string | null;
  historia?: string | null;
  frase_institucional?: string | null;
  valores?: string | null;
  video_institucional?: string | null;
  descricao_video?: string | null;
  logo?: string | null;
  cor_principal?: string | null;
  created_at?: string;
  created_by?: string | null;
  updated_at?: string | null;
}

export interface CompanyValue {
  title: string;
  description: string;
}
