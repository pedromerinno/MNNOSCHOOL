
export interface Note {
  id: string;
  title: string;
  content: string | null;
  color: string | null;
  pinned: boolean | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}
