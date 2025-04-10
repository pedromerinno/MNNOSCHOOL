
export interface CompanyVideo {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  duration: string | null;
  order_index: number;
}
