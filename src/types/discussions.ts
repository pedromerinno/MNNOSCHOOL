
export interface Discussion {
  id: string;
  title: string;
  content: string;
  author_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  video_url?: string | null;
  status: 'open' | 'closed';
  profiles?: {
    display_name: string | null;
    avatar: string | null;
  } | null;
  discussion_replies: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  author_id: string;
  content: string;
  created_at: string;
  image_url: string | null;
  video_url?: string | null;
  profiles?: {
    display_name: string | null;
    avatar: string | null;
  } | null;
}
