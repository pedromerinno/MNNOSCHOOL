
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseCarousel } from "@/components/courses/CourseCarousel";
import { RecentlyLaunched } from "@/components/courses/RecentlyLaunched";
import { CourseCategories } from "@/components/courses/CourseCategories";
import { useCoursesPage } from "@/hooks/useCoursesPage";

const Courses = () => {
  const {
    featuredCourses,
    recentCourses,
    loading,
    companyColor
  } = useCoursesPage();

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-12 px-4 py-6">
        {/* Featured Courses Carousel */}
        <CourseCarousel 
          courses={featuredCourses} 
          loading={loading} 
        />
        
        {/* Recently Launched Section */}
        <div className="space-y-8">
          <RecentlyLaunched 
            courses={recentCourses} 
            loading={loading}
            companyColor={companyColor}
          />
          
          {/* Categories Section */}
          <CourseCategories />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
