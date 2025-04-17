
import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseCarousel } from "@/components/courses/CourseCarousel";
import { CourseCategories } from "@/components/courses/CourseCategories";
import { useCoursesPage } from "@/hooks/useCoursesPage";

const Courses = () => {
  const navigate = useNavigate();
  const {
    featuredCourses,
    allCompanyCourses,
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
        
        {/* Categories - Right after the carousel */}
        <CourseCategories />
        
        {/* All Company Courses */}
        <div className="space-y-8">
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Todos os cursos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allCompanyCourses?.map((course) => (
                <div 
                  key={course.id} 
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <img
                    src={course.image_url || "https://source.unsplash.com/random"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex gap-2 mb-2">
                      {course.tags?.map((tag: string, index: number) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 text-xs rounded-full bg-white/10 text-white border border-white/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-white font-medium">{course.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
