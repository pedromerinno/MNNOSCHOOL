
// Define types for the courses module
export type FilterOption = 'all' | 'newest' | 'popular';

export interface Course {
  id: string;
  title: string;
  image_url?: string;
  description?: string;
  tags?: string[];
  instructor?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CoursePageState {
  activeFilter: FilterOption;
  featuredCourses: Course[];
  allCompanyCourses: Course[];
  loading: boolean;
  allCoursesLoading: boolean;
  companyColor: string;
  lastSelectedCompanyId: string | null;
  isDataReady: boolean;
}
