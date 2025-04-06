
export interface Company {
  id: string;
  nome: string;
  logo: string | null;
  frase_institucional: string | null;
  missao: string | null;
  historia: string | null;
  valores: string | null;
  video_institucional: string | null;
  descricao_video: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCompanyRelation {
  id: string;
  user_id: string;
  company_id: string;
  created_at: string;
}
