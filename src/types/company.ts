
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

// Interface for the result of the user company search
export interface UserCompanyDetails {
  company: Company | null;
  loading: boolean;
  error: Error | null;
}

// Selected company context interface
export interface SelectedCompanyContext {
  selectedCompany: Company | null;
  userCompanies: Company[];
  loading: boolean;
  selectCompany: (company: Company) => void;
}
