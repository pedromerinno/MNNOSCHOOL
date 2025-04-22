
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseCarousel } from "@/components/courses/CourseCarousel";
import { CourseCategories } from "@/components/courses/CourseCategories";
import { useCoursesPage } from "@/hooks/useCoursesPage";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { NewCourseDialog } from "@/components/admin/dialogs/NewCourseDialog";
import { EmptyCoursesState } from "@/components/courses/EmptyCoursesState";
import { CoursesGrid } from "@/components/courses/CoursesGrid";
import { CoursesLoadingSkeleton } from "@/components/courses/CoursesLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Courses = () => {
  const { selectedCompany, isLoading: companyLoading, user } = useCompanies();
  const {
    featuredCourses,
    allCompanyCourses,
    loading,
    allCoursesLoading,
    companyColor,
    isDataReady
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

  const availableCategories = React.useMemo(() => {
    if (!allCompanyCourses) return [];
    
    const categories = new Set<string>();
    allCompanyCourses.forEach(course => {
      course.tags?.forEach(tag => categories.add(tag));
    });
    
    return Array.from(categories);
  }, [allCompanyCourses]);

  const filteredCourses = allCompanyCourses?.filter(course => {
    if (activeCategory === "all") return true;
    return course.tags?.includes(activeCategory);
  });

  if (companyLoading || !selectedCompany) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-screen-2xl space-y-12 px-4 py-6">
          <div className="w-full h-64">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full" />
              ))}
            </div>
          </div>
          <CoursesLoadingSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  const hasNoCourses = !allCompanyCourses || allCompanyCourses.length === 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-12 px-4 py-6">
        {/* Admin Create Course Button */}
        {isAdmin && (
          <div className="flex justify-end">
            <Button
              onClick={() => setIsNewCourseDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Criar um novo curso
            </Button>
          </div>
        )}

        {hasNoCourses ? (
          <EmptyCoursesState
            companyName={selectedCompany.nome}
            isAdmin={isAdmin}
            onCreateCourse={() => setIsNewCourseDialogOpen(true)}
          />
        ) : (
          <>
            <CourseCarousel 
              courses={featuredCourses} 
              loading={loading} 
            />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Categorias</h2>
              <CourseCategories 
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                availableCategories={availableCategories}
              />
            </div>
            
            <div className="space-y-8">
              <div className="space-y-8">
                <h2 className="text-xl font-semibold">Todos os cursos</h2>
                
                {allCoursesLoading ? (
                  <CoursesLoadingSkeleton />
                ) : (
                  <CoursesGrid courses={filteredCourses} />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <NewCourseDialog 
        open={isNewCourseDialogOpen}
        onOpenChange={setIsNewCourseDialogOpen}
      />
    </DashboardLayout>
  );
};

export default Courses;
