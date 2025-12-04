import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MyCoursesLayout } from "@/components/courses/MyCoursesLayout";
import { CourseCategories } from "@/components/courses/CourseCategories";
import { HorizontalCourseList } from "@/components/courses/HorizontalCourseList";
import { CoursesGridSection } from "@/components/courses/CoursesGridSection";
import { CourseSidebar } from "@/components/courses/CourseSidebar";
import { MyCoursesHeader } from "@/components/courses/MyCoursesHeader";
import { MyCoursesHeroBanner } from "@/components/courses/MyCoursesHeroBanner";
import { Preloader } from "@/components/ui/Preloader";
import { useCompanies } from "@/hooks/useCompanies";
import { useMyCourses } from "@/hooks/my-courses";
import { useAuth } from "@/contexts/AuthContext";

const MyCourses = () => {
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [showPreloader, setShowPreloader] = useState(true);
  
  // Chamar useMyCourses apenas quando há empresa selecionada para evitar chamadas desnecessárias
  // Mas precisamos do loading mesmo sem empresa para controlar o preloader
  const coursesData = useMyCourses();
  const coursesLoading = selectedCompany ? coursesData.loading : false;

  // Controlar quando parar de mostrar o preloader
  // Incluir coursesLoading para evitar rerender duplo
  // Remover timeout desnecessário para carregar mais rápido
  useEffect(() => {
    if (!authLoading && user && userProfile && !companyLoading && !coursesLoading) {
      // Mostrar conteúdo imediatamente quando dados estiverem prontos
      setShowPreloader(false);
    } else {
      // Se ainda está carregando algo, manter o preloader
      setShowPreloader(true);
    }
  }, [authLoading, user, userProfile, companyLoading, coursesLoading]);

  // Mostrar preloader durante carregamento inicial, auth loading, company loading ou courses loading
  if (showPreloader || (authLoading && !user) || companyLoading || coursesLoading) {
    return <Preloader />;
  }

  // Show message if no company is selected
  if (!selectedCompany) {
    return (
      <MyCoursesLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Nenhuma empresa selecionada</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Selecione uma empresa para ver seus cursos.
          </p>
        </div>
      </MyCoursesLayout>
    );
  }

  return <MyCoursesContent coursesData={coursesData} />;
};

// Componente separado para o conteúdo quando há empresa selecionada
const MyCoursesContent = ({ coursesData }: { coursesData: ReturnType<typeof useMyCourses> }) => {
  const [searchParams] = useSearchParams();
  const {
    activeFilter,
    stats,
    recentCourses,
    filteredCourses,
    allCourses,
    loading,
    hoursWatched,
    handleFilterChange,
    companyColor
  } = coursesData;

  const [activeCategory, setActiveCategory] = useState("all");

  // Aplicar filtro de favoritos se houver query parameter
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'favorites' && activeFilter !== 'favorites') {
      handleFilterChange('favorites');
    } else if (!filterParam && activeFilter !== 'all') {
      handleFilterChange('all');
    }
  }, [searchParams, activeFilter, handleFilterChange]);

  // Get available categories from courses
  // Use allCourses when filter is 'all' to show all tags, otherwise use filteredCourses
  const availableCategories = useMemo(() => {
    const coursesToUse = activeFilter === 'all' ? allCourses : filteredCourses;
    const categories = new Set<string>();
    coursesToUse.forEach(course => {
      course.tags?.forEach(tag => {
        const normalizedTag = tag.trim().toLowerCase();
        if (normalizedTag) {
          categories.add(normalizedTag);
        }
      });
    });
    return Array.from(categories).sort();
  }, [activeFilter, allCourses, filteredCourses]);

  // Get featured course (first course in progress or first course)
  const featuredCourse = useMemo(() => {
    const inProgress = recentCourses.find(c => c.progress > 0 && c.progress < 100);
    return inProgress || recentCourses[0] || filteredCourses[0];
  }, [recentCourses, filteredCourses]);

  // Filter courses by category
  const categoryFilteredCourses = useMemo(() => {
    if (activeCategory === "all") return filteredCourses;
    return filteredCourses.filter(course =>
      course.tags?.some(tag => tag.trim().toLowerCase() === activeCategory.toLowerCase())
    );
  }, [filteredCourses, activeCategory]);

  // Não precisa mais mostrar preloader aqui, já está sendo controlado no componente pai

  return (
    <MyCoursesLayout>
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Main Content and Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Header with greeting, search, and time */}
            <MyCoursesHeader />
            {/* Hero Banner - Featured Course */}
            {featuredCourse && !loading && (
              <MyCoursesHeroBanner 
                course={featuredCourse} 
                companyColor={companyColor}
              />
            )}

            {/* Category Filters */}
            <div className="space-y-4" data-categories-section>
              <CourseCategories
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                availableCategories={availableCategories}
              />
            </div>

            {/* Courses Section - Grid */}
            {categoryFilteredCourses.length > 0 && (
              <CoursesGridSection
                title="Cursos"
                courses={categoryFilteredCourses}
                loading={loading}
                companyColor={companyColor}
                showParticipants={false}
                showProgress={true}
                showFavorite={true}
              />
            )}

            {/* Continue Watching Section */}
            {recentCourses.length > 0 && (
              <HorizontalCourseList
                title="Continue assistindo"
                courses={recentCourses}
                loading={loading}
                companyColor={companyColor}
                showParticipants={true}
              />
            )}

            {/* Empty State */}
            {!loading && categoryFilteredCourses.length === 0 && recentCourses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {activeCategory === "all" 
                    ? "Não há cursos disponíveis no momento."
                    : `Não há cursos na categoria "${activeCategory}".`}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Fixed width on desktop */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <CourseSidebar 
              stats={stats} 
              hoursWatched={hoursWatched}
            />
          </div>
        </div>
      </div>
    </MyCoursesLayout>
  );
};

export default MyCourses;
