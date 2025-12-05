/**
 * Standard Course type for reusable course components
 * This type is designed to be flexible and work across different contexts
 */
export interface StandardCourse {
  id: string;
  title: string;
  image_url?: string | null;
  tags?: string[];
  progress?: number;
  completed?: boolean;
  favorite?: boolean;
  description?: string;
  instructor?: string;
  participants?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
  }>;
  participantsCount?: number;
  last_accessed?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Props for StandardCourseCard component
 */
export interface StandardCourseCardConfig {
  companyColor?: string;
  showParticipants?: boolean;
  showProgress?: boolean;
  showFavorite?: boolean;
  variant?: "horizontal" | "vertical";
  onFavoriteToggle?: (courseId: string) => void | Promise<void>;
}





