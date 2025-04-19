
export interface Discussion {
  id: string;
  title: string;
  content: string;
  author_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
    avatar: string | null;
  };
  discussion_replies: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar: string | null;
  };
}
