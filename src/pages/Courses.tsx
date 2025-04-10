
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { RecentCourses } from "@/components/courses/RecentCourses";
import { FeaturedCourse } from "@/components/courses/FeaturedCourse";
import { CoursesHeader } from "@/components/courses/CoursesHeader";
import { CourseCatalogHeader } from "@/components/courses/CourseCatalogHeader";
import { useCoursesPage } from "@/hooks/useCoursesPage";

const Courses = () => {
  const {
    activeFilter,
    setActiveFilter,
    featuredCourse,
    recentCourses,
    loading,
    recentLoading,
    companyColor,
    getTitle
  } = useCoursesPage();

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-8 px-4 py-6">
        <CoursesHeader 
          title={getTitle()} 
          subtitle="Explore todos os cursos disponíveis para sua empresa" 
        />
        
        {featuredCourse && <FeaturedCourse course={featuredCourse} />}
        
        {recentCourses.length > 0 && (
          <RecentCourses 
            courses={recentCourses} 
            loading={recentLoading} 
            companyColor={companyColor} 
          />
        )}
        
        <CourseCatalogHeader setActiveFilter={setActiveFilter} />
        
        <CourseList 
          title="" 
          filter="all" 
        />
      </div>
    </DashboardLayout>
  );
};

export default Courses;
