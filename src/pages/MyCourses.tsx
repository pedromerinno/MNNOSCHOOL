
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useMyCourses } from "@/hooks/my-courses";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { RecentCourses } from "@/components/courses/RecentCourses";
import { FilteredCoursesList } from "@/components/courses/FilteredCoursesList";
import { CourseSidebar } from "@/components/courses/CourseSidebar";

const MyCourses = () => {
  const {
    activeFilter,
    stats,
    recentCourses,
    filteredCourses,
    loading,
    hoursWatched,
    handleFilterChange,
    companyColor
  } = useMyCourses();

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
