
import { useState, useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { FilterOption, CoursePageState, Course } from "./types";

export function useCoursesState(): CoursePageState & {
  setActiveFilter: (filter: FilterOption) => void;
  setFeaturedCourses: (courses: Course[]) => void;
  setAllCompanyCourses: (courses: Course[]) => void;
  setLoading: (loading: boolean) => void;
  setAllCoursesLoading: (loading: boolean) => void;
  setLastSelectedCompanyId: (id: string | null) => void;
  initialLoadDone: React.MutableRefObject<boolean>;
} {
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [allCompanyCourses, setAllCompanyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCoursesLoading, setAllCoursesLoading] = useState(true);
  const [lastSelectedCompanyId, setLastSelectedCompanyId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return {
    activeFilter,
    setActiveFilter,
    featuredCourses,
    setFeaturedCourses,
    allCompanyCourses,
    setAllCompanyCourses,
    loading: loading || companyLoading, // Include company loading state
    setLoading,
    allCoursesLoading: allCoursesLoading || companyLoading, // Include company loading state
    setAllCoursesLoading,
    companyColor,
    lastSelectedCompanyId,
    setLastSelectedCompanyId,
    initialLoadDone,
    isDataReady: initialLoadDone.current
  };
}
