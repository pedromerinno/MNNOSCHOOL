
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useMyCourses } from "@/hooks/my-courses";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { RecentCourses } from "@/components/courses/RecentCourses";
import { FilteredCoursesList } from "@/components/courses/FilteredCoursesList";
import { CourseSidebar } from "@/components/courses/CourseSidebar";
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
    handleFilterChange,
    companyColor
  } = useMyCourses();

  console.log("MyCourses render:", {
    selectedCompany: selectedCompany?.nome || "none",
    companyLoading,
    loading,
    coursesCount: filteredCourses.length
  });

  // Show loading if company is still loading
  if (companyLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-screen-2xl px-4 py-8 bg-transparent dark:bg-[#191919]">
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show message if no company is selected
  if (!selectedCompany) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-screen-2xl px-4 py-8 bg-transparent dark:bg-[#191919]">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Nenhuma empresa selecionada</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Selecione uma empresa para ver seus cursos.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8 bg-transparent dark:bg-[#191919]">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Meus Cursos</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Continue aprendendo de onde parou
            </p>
          </div>
          
          {/* Filters */}
          <CourseFilters 
            activeFilter={activeFilter} 
            onFilterChange={handleFilterChange} 
          />
        </div>
        
        {/* Main Content and Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-3 space-y-8">
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
          <div className="space-y-6">
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
