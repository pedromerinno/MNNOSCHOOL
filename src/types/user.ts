
export interface UserProfile {
  id: string; 
  email: string | null;
  display_name: string | null;
  is_admin: boolean | null;
  super_admin?: boolean | null;
  avatar?: string | null;
  cargo_id?: string | null;
  interesses?: string[] | null;  // Adicionado o campo de interesses
}
