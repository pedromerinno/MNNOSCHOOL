import React, { useMemo, useEffect, memo } from "react";
import { MyCoursesLayout } from "@/components/courses/MyCoursesLayout";
import { CoursesGridSection } from "@/components/courses/CoursesGridSection";
import { MyCoursesHeader } from "@/components/courses/MyCoursesHeader";
import { MyCoursesSkeleton } from "@/components/courses/MyCoursesSkeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useMyCourses } from "@/hooks/my-courses";
import { CourseSidebar } from "@/components/courses/CourseSidebar";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart, Star, BookOpen } from "lucide-react";

const Favoritos = memo(() => {
  const { selectedCompany, isLoading: companyLoading } = useCompanies();

  // Show loading if company is still loading
  if (companyLoading) {
    return <MyCoursesSkeleton />;
  }

  // Show message if no company is selected
  if (!selectedCompany) {
    return (
      <MyCoursesLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Nenhuma empresa selecionada</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Selecione uma empresa para ver seus cursos favoritos.
          </p>
        </div>
      </MyCoursesLayout>
    );
  }

  return <FavoritosContent selectedCompany={selectedCompany} />;
});
Favoritos.displayName = 'Favoritos';

// Componente separado para o conteúdo quando há empresa selecionada
const FavoritosContent = memo(({ selectedCompany }: { selectedCompany: any }) => {
  const {
    stats,
    allCourses,
    loading,
    hoursWatched,
    companyColor,
    handleFilterChange
  } = useMyCourses();

  // Filtrar apenas cursos favoritos
  const favoriteCourses = useMemo(() => {
    return allCourses.filter(course => course.favorite);
  }, [allCourses]);

  // Aplicar filtro de favoritos quando o componente monta
  useEffect(() => {
    handleFilterChange('favorites');
  }, [handleFilterChange]);

  // Show skeleton while loading
  if (loading) {
    return <MyCoursesSkeleton />;
  }

  return (
    <MyCoursesLayout>
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Main Content and Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Header with greeting, search, and time */}
            <MyCoursesHeader />
            
            {/* Clean Header Section */}
            <div 
              className="rounded-2xl px-8 py-10 -mx-2"
              style={{
                backgroundColor: `${companyColor}08`,
              }}
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Favoritos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Seus cursos favoritos em um só lugar
              </p>
            </div>

            {/* Courses Section - Grid */}
            {favoriteCourses.length > 0 && (
              <CoursesGridSection
                title="Todos"
                courses={favoriteCourses}
                loading={loading}
                companyColor={companyColor}
                showParticipants={false}
                showProgress={true}
                showFavorite={true}
              />
            )}

            {/* Empty State */}
            {!loading && favoriteCourses.length === 0 && (
              <div className="flex justify-center py-8">
                <EmptyState
                  title="Nenhum curso favorito encontrado"
                  description="Você ainda não favoritou nenhum curso. Explore os cursos disponíveis e adicione aos favoritos."
                  icons={[Heart, Star, BookOpen]}
                />
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
});
FavoritosContent.displayName = 'FavoritosContent';

export default Favoritos;

