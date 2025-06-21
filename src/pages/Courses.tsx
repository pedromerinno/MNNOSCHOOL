
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseCarousel } from "@/components/courses/CourseCarousel";
import { CourseCategories } from "@/components/courses/CourseCategories";
import { useCoursesPage } from "@/hooks/useCoursesPage";
import { useCompanies } from "@/hooks/useCompanies";
import { NewCourseDialog } from "@/components/admin/dialogs/NewCourseDialog";
import { EmptyCoursesState } from "@/components/courses/EmptyCoursesState";
import { CoursesGrid } from "@/components/courses/CoursesGrid";
import { CoursesPageSkeleton } from "@/components/courses/CoursesPageSkeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Courses = () => {
  const {
    selectedCompany,
    isLoading: companyLoading,
    user
  } = useCompanies();
  const {
    featuredCourses,
    allCompanyCourses,
    loading,
    allCoursesLoading,
    companyColor,
    isDataReady,
    refreshCourses
  } = useCoursesPage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [showContent, setShowContent] = useState(false);
  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(false);
  const isAdmin = user?.is_admin || user?.super_admin;

  useEffect(() => {
    if (!companyLoading && selectedCompany && isDataReady) {
      setShowContent(true);
    }
  }, [companyLoading, selectedCompany, isDataReady]);

  // Auto-refresh data when component mounts
  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const availableCategories = React.useMemo(() => {
    if (!allCompanyCourses) return [];
    const categories = new Set<string>();
    allCompanyCourses.forEach(course => {
      course.tags?.forEach(tag => {
        // Normalize tag to lowercase and trim whitespace to avoid duplicates
        const normalizedTag = tag.trim().toLowerCase();
        if (normalizedTag) {
          categories.add(normalizedTag);
        }
      });
    });
    // Convert back to array and sort alphabetically
    return Array.from(categories).sort();
  }, [allCompanyCourses]);

  const filteredCourses = allCompanyCourses?.filter(course => {
    if (activeCategory === "all") return true;
    // Check if any tag matches the active category (case-insensitive)
    return course.tags?.some(tag => 
      tag.trim().toLowerCase() === activeCategory.toLowerCase()
    );
  });

  // Show skeleton while loading
  if (companyLoading || !selectedCompany || loading) {
    return (
      <DashboardLayout fullWidth>
        {/* Header with Admin Actions - skeleton version */}
        {isAdmin && (
          <div className="w-full max-w-screen-xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        )}
        
        <CoursesPageSkeleton />
      </DashboardLayout>
    );
  }

  const hasNoCourses = !allCompanyCourses || allCompanyCourses.length === 0;

  return (
    <DashboardLayout fullWidth>
      {/* Header with Admin Actions */}
      {isAdmin && (
        <div className="w-full max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Cursos</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Gerencie e visualize todos os cursos disponíveis
              </p>
            </div>
            <Button
              onClick={() => setIsNewCourseDialogOpen(true)}
              className="bg-black hover:bg-gray-800 text-white rounded-xl"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          </div>
        </div>
      )}

      {/* Full width featured courses section */}
      {hasNoCourses ? (
        <div className="w-full max-w-screen-2xl mx-auto px-4">
          <EmptyCoursesState 
            companyName={selectedCompany.nome} 
            isAdmin={isAdmin} 
            onCreateCourse={() => setIsNewCourseDialogOpen(true)} 
          />
        </div>
      ) : (
        <div className="w-full px-0">
          <CourseCarousel courses={featuredCourses} loading={false} />
        </div>
      )}
      
      {/* Centered content with smaller width */}
      {!hasNoCourses && (
        <div className="w-full max-w-screen-xl mx-auto space-y-5 px-0 py-0">
          <div className="space-y-4 py-[30px]">
            <h2 className="text-xl font-semibold">Categorias</h2>
            <CourseCategories 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
              availableCategories={availableCategories} 
            />
          </div>
          
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Todos os cursos</h2>
              
              {allCoursesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, index) => (
                    <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <CoursesGrid courses={filteredCourses} />
              )}
            </div>
          </div>
        </div>
      )}

      <NewCourseDialog 
        open={isNewCourseDialogOpen} 
        onOpenChange={setIsNewCourseDialogOpen} 
      />
    </DashboardLayout>
  );
};

export default Courses;
