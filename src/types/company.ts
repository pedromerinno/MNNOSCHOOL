
export interface Company {
  id: string;
  nome: string;
  descricao?: string | null;
  responsavel?: string | null;
  logo?: string | null;
  historia?: string | null;
  missao?: string | null;
  valores?: string | null;
  frase_institucional?: string | null;
  cor_principal?: string | null;
  video_institucional?: string | null;
  descricao_video?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}
