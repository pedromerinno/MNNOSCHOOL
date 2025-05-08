
import { useState, useRef } from 'react';
import { useCompanies } from "@/hooks/useCompanies";

export function useCoursesState() {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<'all' | 'newest' | 'popular'>('all');
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [allCompanyCourses, setAllCompanyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCoursesLoading, setAllCoursesLoading] = useState(true);
  const [lastSelectedCompanyId, setLastSelectedCompanyId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  const isDataReady = initialLoadDone.current;
  
  return {
    activeFilter,
    setActiveFilter,
    featuredCourses,
    setFeaturedCourses,
    allCompanyCourses,
    setAllCompanyCourses,
    loading,
    setLoading,
    allCoursesLoading,
    setAllCoursesLoading,
    companyColor,
    lastSelectedCompanyId,
    setLastSelectedCompanyId,
    initialLoadDone,
    isDataReady
  };
}
