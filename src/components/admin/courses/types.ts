
export type Course = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  instructor: string | null;
  created_at: string;
  tags?: string[]; // Add tags property to Course type
};
