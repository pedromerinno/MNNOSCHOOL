
export interface UserProfile {
  id: string; 
  email: string | null;
  display_name: string | null;
  is_admin: boolean | null;
  super_admin?: boolean | null;
  avatar?: string | null;
  cargo_id?: string | null;
  primeiro_login?: boolean | null; // Adicionado o campo primeiro_login
  created_at?: string | null; // Campo para data de criação do perfil
}
