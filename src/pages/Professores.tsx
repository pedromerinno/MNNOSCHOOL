import React, { useMemo, memo } from "react";
import { MyCoursesLayout } from "@/components/courses/MyCoursesLayout";
import { MyCoursesHeader } from "@/components/courses/MyCoursesHeader";
import { MyCoursesSkeleton } from "@/components/courses/MyCoursesSkeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useMyCourses } from "@/hooks/my-courses";
import { CourseSidebar } from "@/components/courses/CourseSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Users, Award } from "lucide-react";
import { getInitials } from "@/utils/stringUtils";

interface Professor {
  name: string;
  coursesCount: number;
  totalStudents: number;
  imageUrl?: string;
}

const Professores = memo(() => {
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
            Selecione uma empresa para ver os professores.
          </p>
        </div>
      </MyCoursesLayout>
    );
  }

  return <ProfessoresContent selectedCompany={selectedCompany} />;
});
Professores.displayName = 'Professores';

const ProfessoresContent = memo(({ selectedCompany }: { selectedCompany: any }) => {
  const {
    stats,
    allCourses,
    loading,
    hoursWatched,
    companyColor
  } = useMyCourses();

  // Extrair professores únicos dos cursos
  const professores = useMemo(() => {
    const professorMap = new Map<string, Professor>();
    
    allCourses.forEach(course => {
      if (course.instructor) {
        const instructorName = course.instructor.trim();
        
        if (!professorMap.has(instructorName)) {
          professorMap.set(instructorName, {
            name: instructorName,
            coursesCount: 0,
            totalStudents: 0,
            imageUrl: undefined
          });
        }
        
        const professor = professorMap.get(instructorName)!;
        professor.coursesCount += 1;
        // Simular número de estudantes (em produção, viria do backend)
        professor.totalStudents += Math.floor(Math.random() * 50) + 10;
      }
    });
    
    return Array.from(professorMap.values()).sort((a, b) => 
      b.coursesCount - a.coursesCount
    );
  }, [allCourses]);

  if (loading) {
    return <MyCoursesSkeleton />;
  }

  return (
    <MyCoursesLayout>
      <div className="w-full max-w-[1600px] mx-auto">
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
                Professores
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Conheça os professores dos seus cursos
              </p>
            </div>

            {/* Grid de professores */}
            {professores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professores.map((professor, index) => (
                  <Card 
                    key={index}
                    className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-16 w-16 ring-2 ring-gray-200 dark:ring-gray-700">
                          <AvatarImage 
                            src={professor.imageUrl || `https://i.pravatar.cc/150?u=${professor.name}`} 
                            alt={professor.name} 
                          />
                          <AvatarFallback 
                            className="text-lg font-semibold"
                            style={{
                              backgroundColor: `${companyColor}15`,
                              color: companyColor,
                            }}
                          >
                            {getInitials(professor.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Informações */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 truncate">
                            {professor.name}
                          </h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <BookOpen className="h-4 w-4" style={{ color: companyColor }} />
                              <span>{professor.coursesCount} {professor.coursesCount === 1 ? 'curso' : 'cursos'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Users className="h-4 w-4" style={{ color: companyColor }} />
                              <span>{professor.totalStudents} estudantes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Award className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Nenhum professor encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Não há professores cadastrados nos cursos disponíveis.
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
});
ProfessoresContent.displayName = 'ProfessoresContent';

export default Professores;
