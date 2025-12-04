import React, { useMemo, memo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MyCoursesLayout } from "@/components/courses/MyCoursesLayout";
import { CoursesGridSection } from "@/components/courses/CoursesGridSection";
import { MyCoursesHeader } from "@/components/courses/MyCoursesHeader";
import { MyCoursesSkeleton } from "@/components/courses/MyCoursesSkeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useMyCourses } from "@/hooks/my-courses";
import { CourseSidebar } from "@/components/courses/CourseSidebar";

const Sugeridos = memo(() => {
  const { selectedCompany, isLoading: companyLoading } = useCompanies();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topicParam = searchParams.get('topic');

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
            Selecione uma empresa para ver seus cursos sugeridos.
          </p>
        </div>
      </MyCoursesLayout>
    );
  }

  return <SugeridosContent selectedCompany={selectedCompany} topicParam={topicParam} />;
});
Sugeridos.displayName = 'Sugeridos';

// Componente separado para o conteúdo quando há empresa selecionada
const SugeridosContent = memo(({ selectedCompany, topicParam }: { selectedCompany: any; topicParam: string | null }) => {
  const {
    stats,
    filteredCourses,
    loading,
    hoursWatched,
    companyColor
  } = useMyCourses();

  // Filter courses by topic if provided in URL
  const categoryFilteredCourses = useMemo(() => {
    if (!topicParam) return filteredCourses;
    return filteredCourses.filter(course =>
      course.tags?.some(tag => tag.trim().toLowerCase() === topicParam.toLowerCase())
    );
  }, [filteredCourses, topicParam]);

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
                Cursos Sugeridos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {topicParam 
                  ? `Cursos relacionados ao tema "${topicParam}"`
                  : "Explore cursos sugeridos especialmente para você"}
              </p>
            </div>

            {/* Courses Section - Grid */}
            {categoryFilteredCourses.length > 0 && (
              <CoursesGridSection
                title="Todos"
                courses={categoryFilteredCourses}
                loading={loading}
                companyColor={companyColor}
                showParticipants={false}
                showProgress={true}
                showFavorite={true}
              />
            )}

            {/* Empty State */}
            {!loading && categoryFilteredCourses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {topicParam 
                    ? `Não há cursos sugeridos na categoria "${topicParam}".`
                    : "Não há cursos sugeridos disponíveis no momento."}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Fixed width on desktop */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <CourseSidebar 
              stats={stats} 
              hoursWatched={hoursWatched}
              onTopicClick={(topicName) => {
                navigate(`/sugeridos?topic=${encodeURIComponent(topicName)}`);
              }}
            />
          </div>
        </div>
      </div>
    </MyCoursesLayout>
  );
});
SugeridosContent.displayName = 'SugeridosContent';

export default Sugeridos;

