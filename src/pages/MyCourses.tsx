
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useMyCourses } from "@/hooks/my-courses";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { RecentCourses } from "@/components/courses/RecentCourses";
import { FilteredCoursesList } from "@/components/courses/FilteredCoursesList";
import { CourseSidebar } from "@/components/courses/CourseSidebar";
import { Loader2 } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

const MyCourses = () => {
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const {
    activeFilter,
    stats,
    recentCourses,
    filteredCourses,
    loading,
    hoursWatched,
    initialized,
    handleFilterChange,
    companyColor,
    companyLoading: myCourseCompanyLoading
  } = useMyCourses();
  
  useEffect(() => {
    console.log("MyCourses rendered", { 
      loading, 
      companyLoading, 
      selectedCompany: selectedCompany?.nome,
      filteredCourses: filteredCourses.length,
      recentCourses: recentCourses.length
    });
  }, [loading, companyLoading, selectedCompany, filteredCourses.length, recentCourses.length]);

  // Show loading state when data is being fetched or company is loading
  if ((loading || companyLoading) && (!initialized || !filteredCourses.length)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-4">
        {/* Filters */}
        <CourseFilters 
          activeFilter={activeFilter} 
          onFilterChange={handleFilterChange} 
        />
        
        {/* Main Content and Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 space-y-6">
            {/* Recent Courses */}
            <RecentCourses 
              courses={recentCourses} 
              loading={loading}
              companyColor={companyColor}
            />
            
            {/* Filtered Courses */}
            <FilteredCoursesList 
              courses={filteredCourses} 
              loading={loading} 
              activeFilter={activeFilter}
              companyColor={companyColor}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6 mt-0">
            <CourseSidebar 
              stats={stats} 
              hoursWatched={hoursWatched} 
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
