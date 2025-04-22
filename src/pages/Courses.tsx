
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseCarousel } from "@/components/courses/CourseCarousel";
import { CourseCategories } from "@/components/courses/CourseCategories";
import { useCoursesPage } from "@/hooks/useCoursesPage";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { NewCourseDialog } from "@/components/admin/dialogs/NewCourseDialog";

const Courses = () => {
  const navigate = useNavigate();
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

  // Controle de exibição do conteúdo para evitar "piscar"
  useEffect(() => {
    if (!companyLoading && selectedCompany && isDataReady) {
      setShowContent(true);
    }
  }, [companyLoading, selectedCompany, isDataReady]);

  // Extract unique categories from all courses
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

  // Se estiver carregando a empresa ou não houver empresa selecionada, mostrar skeleton
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
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Conteúdo real só é mostrado quando dados estão prontos
  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-12 px-4 py-6">
        {/* Featured Courses Carousel */}
        <CourseCarousel 
          courses={featuredCourses} 
          loading={loading} 
        />
        
        {/* Categories - Right after the carousel */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Categorias</h2>
          <CourseCategories 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            availableCategories={availableCategories}
          />
        </div>
        
        {/* All Company Courses */}
        <div className="space-y-8">
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Todos os cursos</h2>
            
            {allCoursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                ))}
              </div>
            ) : filteredCourses?.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                  Em breve, aqui estarão todos os cursos da {selectedCompany.nome}.
                </p>
                {isAdmin && (
                  <Button
                    onClick={() => setIsNewCourseDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Criar um novo curso
                  </Button>
                )}
              </div>
            ) : (
              // Courses grid
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCourses?.map((course) => (
                  <div 
                    key={course.id} 
                    className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <img
                      src={course.image_url || "https://source.unsplash.com/random"}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="flex gap-2 mb-2">
                        {course.tags?.map((tag: string, index: number) => (
                          <span 
                            key={index} 
                            className="px-4 py-1.5 text-xs rounded-xl bg-white/20 text-white border border-white/40"
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
            )}
          </div>
        </div>
      </div>

      <NewCourseDialog 
        open={isNewCourseDialogOpen}
        onOpenChange={setIsNewCourseDialogOpen}
      />
    </DashboardLayout>
  );
};

export default Courses;

