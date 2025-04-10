
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { Book, Clock, CheckCircle, Star, ListCheck, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CourseProgress } from "@/components/courses/CourseProgress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type FilterOption = 'all' | 'favorites' | 'completed' | 'in-progress';

const MyCourses = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [stats, setStats] = useState({
    favorites: 0,
    inProgress: 0,
    completed: 0,
    videosCompleted: 0
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoursWatched, setHoursWatched] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCompany) return;
      
      setLoading(true);
      try {
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        // Fetch courses for company
        const { data: companyAccess, error: accessError } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (accessError) throw accessError;
        
        if (!companyAccess || companyAccess.length === 0) {
          setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
          setRecentCourses([]);
          setFilteredCourses([]);
          setAllCourses([]);
          setLoading(false);
          return;
        }
        
        const courseIds = companyAccess.map(access => access.course_id);
        
        // Get user progress for these courses
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('course_id, progress, completed, last_accessed, favorite')
          .eq('user_id', user.id)
          .in('course_id', courseIds);
        
        if (progressError) {
          console.error('Error fetching progress:', progressError);
          toast({
            title: "Erro ao carregar progresso",
            description: progressError.message,
            variant: "destructive",
          });
          // Continue with empty progress data instead of throwing an error
          const emptyProgress: any[] = [];
          
          // Process with empty progress data
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds);
          
          if (coursesError) throw coursesError;
          
          const coursesWithProgress = coursesData?.map(course => {
            return {
              ...course,
              progress: 0,
              completed: false,
              last_accessed: null,
              favorite: false
            };
          }) || [];
          
          setAllCourses(coursesWithProgress);
          setFilteredCourses(coursesWithProgress);
          setRecentCourses([]);
          setStats({favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0});
          setHoursWatched(0);
          setLoading(false);
          return;
        }
        
        // Fetch all courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);
        
        if (coursesError) throw coursesError;
        
        // Get completed lessons count for video stats
        const { data: lessonProgressData, error: lessonProgressError } = await supabase
          .from('user_lesson_progress')
          .select('id, completed')
          .eq('user_id', user.id)
          .eq('completed', true);
        
        if (lessonProgressError) {
          console.error('Error fetching lesson progress:', lessonProgressError);
        }
        
        const completedLessonsCount = lessonProgressData?.length || 0;
        
        // Calculate hours watched (mock data for now, could be replaced with actual tracking)
        // Here we estimate 15 minutes per completed lesson
        const estimatedHoursWatched = Math.round((completedLessonsCount * 15) / 60 * 10) / 10;
        
        const progressMap = progressData || [];
        const inProgress = progressMap.filter(p => p.progress > 0 && !p.completed).length;
        const completed = progressMap.filter(p => p.completed).length;
        const favorites = progressMap.filter(p => p.favorite).length || 0;
        
        setStats({
          favorites,
          inProgress,
          completed,
          videosCompleted: completedLessonsCount
        });
        
        setHoursWatched(estimatedHoursWatched);
        
        // Process courses with progress info
        const coursesWithProgress = coursesData?.map(course => {
          const progress = progressMap.find(p => p.course_id === course.id);
          return {
            ...course,
            progress: progress?.progress || 0,
            completed: progress?.completed || false,
            last_accessed: progress?.last_accessed || null,
            favorite: progress?.favorite || false
          };
        }) || [];
        
        setAllCourses(coursesWithProgress);
        
        // Get courses in progress (not completed and with progress > 0)
        const inProgressCourses = coursesWithProgress
          .filter(c => c.progress > 0 && !c.completed)
          .sort((a, b) => {
            // Sort by last accessed, if available
            if (a.last_accessed && b.last_accessed) {
              return new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime();
            }
            // If no last_accessed, sort by progress (higher progress first)
            return b.progress - a.progress;
          });
        
        setRecentCourses(inProgressCourses.slice(0, 3));
        
        // Initially set filtered courses based on active filter
        filterCourses(coursesWithProgress, activeFilter);
      } catch (error: any) {
        console.error('Error fetching course stats:', error);
        toast({
          title: "Erro ao carregar cursos",
          description: error.message || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
        // Reset states on error
        setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 0 });
        setRecentCourses([]);
        setFilteredCourses([]);
        setAllCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [selectedCompany, toast]);

  // Filter courses based on selected tab
  const filterCourses = (courses: any[], filter: FilterOption) => {
    switch (filter) {
      case 'favorites':
        setFilteredCourses(courses.filter(course => course.favorite));
        break;
      case 'completed':
        setFilteredCourses(courses.filter(course => course.completed));
        break;
      case 'in-progress':
        setFilteredCourses(courses.filter(course => course.progress > 0 && !course.completed));
        break;
      case 'all':
      default:
        setFilteredCourses(courses);
        break;
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: FilterOption) => {
    setActiveFilter(newFilter);
    filterCourses(allCourses, newFilter);
  };

  // Get company color for styling
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-4">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 gap-3">
            <Button variant="outline" 
                className={`rounded-full px-4 py-2 ${activeFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'} border-none hover:bg-gray-800 hover:text-white`}
                onClick={() => handleFilterChange('all')}>
              <ListCheck className="mr-2 h-4 w-4" />
              Todos
            </Button>
            <Button variant="outline" 
                className={`rounded-full px-4 py-2 ${activeFilter === 'favorites' ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-700'} border-none hover:bg-orange-500 hover:text-white`}
                onClick={() => handleFilterChange('favorites')}>
              <Star className="mr-2 h-4 w-4" />
              Favoritados
            </Button>
            <Button variant="outline" 
                className={`rounded-full px-4 py-2 ${activeFilter === 'completed' ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-700'} border-none hover:bg-green-500 hover:text-white`}
                onClick={() => handleFilterChange('completed')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Concluídos
            </Button>
            <Button variant="outline" 
                className={`rounded-full px-4 py-2 ${activeFilter === 'in-progress' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'} border-none hover:bg-blue-500 hover:text-white`}
                onClick={() => handleFilterChange('in-progress')}>
              <Play className="mr-2 h-4 w-4" />
              Iniciados
            </Button>
          </div>
        </div>
        
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 space-y-6">
            {/* Continue Assistindo */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Continue assistindo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                  ))
                ) : recentCourses.length > 0 ? (
                  recentCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => navigate(`/courses/${course.id}`)}>
                      <div className="relative h-40">
                        <img 
                          src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex gap-2 mb-2">
                          {course.tags && course.tags.length > 0 ? (
                            course.tags.slice(0, 2).map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">{tag}</Badge>
                            ))
                          ) : (
                            <>
                              <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">Curso</Badge>
                            </>
                          )}
                        </div>
                        
                        <h3 className="font-medium mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 mb-1">
                          <div 
                            className="h-1.5 rounded-full" 
                            style={{ 
                              width: `${course.progress}%`,
                              backgroundColor: companyColor
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center mt-4">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                                <img 
                                  src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                                  alt="User" 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">+8</span>
                          <Button variant="ghost" size="sm" className="ml-auto p-0 h-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-3">Nenhum curso em progresso encontrado.</p>
                )}
              </div>
            </div>
            
            {/* Filtered Courses List */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                {activeFilter === 'all' ? 'Todos os cursos' : 
                 activeFilter === 'favorites' ? 'Cursos favoritos' :
                 activeFilter === 'completed' ? 'Cursos concluídos' : 'Cursos iniciados'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                  ))
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => navigate(`/courses/${course.id}`)}>
                      <div className="relative h-40">
                        <img 
                          src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex gap-2 mb-2">
                          {course.tags && course.tags.length > 0 ? (
                            course.tags.slice(0, 2).map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">{tag}</Badge>
                            ))
                          ) : (
                            <>
                              <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">Curso</Badge>
                            </>
                          )}
                        </div>
                        
                        <h3 className="font-medium mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 mb-1">
                          <div 
                            className="h-1.5 rounded-full" 
                            style={{ 
                              width: `${course.progress}%`,
                              backgroundColor: companyColor
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center mt-4">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                                <img 
                                  src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                                  alt="User" 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">+8</span>
                          <Button variant="ghost" size="sm" className="ml-auto p-0 h-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-3">Nenhum curso encontrado para este filtro.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6 mt-0">  {/* Removed mt-8 to align with top */}
            {/* Video stats card */}
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Aulas completas</h3>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </Button>
                </div>
                <div className="text-center pb-4">
                  <span className="text-7xl font-bold block">
                    {stats.videosCompleted.toString().padStart(2, '0')}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Hours watched card */}
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Horas assistidas</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Ano</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold">{hoursWatched} horas</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      bom trabalho
                    </Badge>
                  </div>
                  
                  {/* Chart */}
                  <div className="h-32 flex items-end gap-1">
                    {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((month, idx) => {
                      // Random heights for bars between 10% and 100%
                      const height = 20 + Math.floor(Math.random() * 80);
                      return (
                        <div key={month} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-400 rounded-sm" 
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className="text-xs mt-1 text-gray-500">{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Suggested Topics */}
            <div>
              <h3 className="text-lg font-medium mb-4">Temas Sugeridos</h3>
              <div className="space-y-3">
                <Card className="overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="6"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                      </div>
                      <span>UI & UI</span>
                    </div>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
                          <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
                          <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
                          <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
                          <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
                        </svg>
                      </div>
                      <span>Motion Designer</span>
                    </div>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
