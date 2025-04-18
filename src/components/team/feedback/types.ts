
export interface FeedbackProfile {
  id: string;
  display_name: string | null;
  avatar: string | null;
}

export interface Feedback {
  id: string;
  content: string;
  created_at: string;
  from_user_id: string;
  from_profile?: FeedbackProfile | null;
}

export interface FeedbackListProps {
  feedbacks: Feedback[];
}
