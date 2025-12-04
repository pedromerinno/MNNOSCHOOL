import React, { useState, useMemo, memo } from "react";
import { MyCoursesLayout } from "@/components/courses/MyCoursesLayout";
import { MyCoursesHeader } from "@/components/courses/MyCoursesHeader";
import { MyCoursesSkeleton } from "@/components/courses/MyCoursesSkeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useMyCourses } from "@/hooks/my-courses";
import { CourseSidebar } from "@/components/courses/CourseSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const Performance = memo(() => {
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
            Selecione uma empresa para ver seu desempenho.
          </p>
        </div>
      </MyCoursesLayout>
    );
  }

  return <PerformanceContent selectedCompany={selectedCompany} />;
});
Performance.displayName = 'Performance';

const PerformanceContent = memo(({ selectedCompany }: { selectedCompany: any }) => {
  const {
    stats,
    allCourses,
    loading,
    hoursWatched,
    companyColor
  } = useMyCourses();

  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');

  // Dados para os gráficos (simulados)
  const chartData = useMemo(() => {
    const baseData = [
      { value: 2 },
      { value: 3 },
      { value: 1 },
      { value: 4 },
      { value: 2 },
      { value: 5 },
      { value: 3 },
      { value: 4 },
    ];
    
    return {
      completed: baseData.map((d, i) => ({ value: Math.max(0, d.value - i * 0.3) })),
      inProgress: baseData.map((d, i) => ({ value: d.value + i * 0.2 })),
      hours: baseData.map((d, i) => ({ value: d.value * 0.5 + i * 0.1 })),
      progress: baseData.map((d, i) => ({ value: Math.min(100, d.value * 10 + i * 2) })),
    };
  }, []);

  // Calcular estatísticas baseadas no período
  const performanceData = useMemo(() => {
    const completedCourses = allCourses.filter(c => c.progress === 100).length;
    const inProgressCourses = allCourses.filter(c => c.progress > 0 && c.progress < 100).length;
    const totalCourses = allCourses.length;
    
    // Simular horas assistidas baseadas no período
    let hoursMultiplier = 1;
    switch (period) {
      case 'week':
        hoursMultiplier = 0.25;
        break;
      case 'month':
        hoursMultiplier = 1;
        break;
      case 'quarter':
        hoursMultiplier = 3;
        break;
      case 'year':
        hoursMultiplier = 12;
        break;
      case 'all':
        hoursMultiplier = 1;
        break;
    }
    
    const periodHours = hoursWatched * hoursMultiplier;
    const averageProgress = totalCourses > 0 
      ? allCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses 
      : 0;

    return {
      completedCourses,
      inProgressCourses,
      totalCourses,
      hoursWatched: periodHours,
      averageProgress: Math.round(averageProgress)
    };
  }, [allCourses, hoursWatched, period]);

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Performance
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Acompanhe seu desempenho nos cursos
                  </p>
                </div>
                
                {/* Filtro de período */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Período:</span>
                  <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                      <SelectItem value="quarter">Último trimestre</SelectItem>
                      <SelectItem value="year">Último ano</SelectItem>
                      <SelectItem value="all">Todo o período</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Cursos Concluídos
                      </h3>
                      <div className="h-8 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData.completed}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={companyColor}
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {performanceData.completedCourses}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      de {performanceData.totalCourses} cursos
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Em Progresso
                      </h3>
                      <div className="h-8 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData.inProgress}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={companyColor}
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {performanceData.inProgressCourses}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      cursos em andamento
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Horas Assistidas
                      </h3>
                      <div className="h-8 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData.hours}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={companyColor}
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {performanceData.hoursWatched.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      horas de conteúdo
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Progresso Médio
                      </h3>
                      <div className="h-8 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData.progress}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={companyColor}
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {performanceData.averageProgress}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      média de conclusão
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card de Progresso dos Cursos - Melhorado */}
            <Card className="border border-gray-100 dark:border-gray-800 overflow-hidden rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Progresso dos Cursos
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Acompanhe seu avanço em cada curso
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm self-start sm:self-auto">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {allCourses.length} cursos
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {allCourses.slice(0, 5).map((course, index) => {
                    const progress = course.progress || 0;
                    const isCompleted = progress === 100;
                    const isInProgress = progress > 0 && progress < 100;
                    
                    return (
                      <div 
                        key={course.id} 
                        className="group relative p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-900/50"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          {/* Thumbnail do curso */}
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img 
                              src={course.image_url || "/placeholder.svg"} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors flex-1 min-w-0">
                                {course.title}
                              </h4>
                              <span 
                                className={cn(
                                  "text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0",
                                  isCompleted && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                                  isInProgress && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                                  !isInProgress && !isCompleted && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                )}
                              >
                                {progress}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isInProgress && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Em andamento
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  Concluído
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de progresso minimal */}
                        <div className="relative">
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden",
                                isCompleted && "bg-gradient-to-r from-green-500 to-green-600",
                                isInProgress && "bg-gradient-to-r",
                                !isInProgress && !isCompleted && "bg-gray-300 dark:bg-gray-700"
                              )}
                              style={{
                                width: `${progress}%`,
                                ...(isInProgress && {
                                  background: `linear-gradient(90deg, ${companyColor} 0%, ${companyColor}dd 50%, ${companyColor} 100%)`
                                })
                              }}
                            >
                              {/* Efeito de brilho animado */}
                              {isInProgress && progress > 0 && (
                                <div 
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {allCourses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Nenhum curso encontrado
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Comece a explorar os cursos disponíveis
                      </p>
                    </div>
                  )}
                  {allCourses.length > 5 && (
                    <div className="pt-2 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mostrando 5 de {allCourses.length} cursos
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
PerformanceContent.displayName = 'PerformanceContent';

export default Performance;
