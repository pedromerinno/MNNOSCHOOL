
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { Book, Clock, CheckCircle, Play, Plus, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CourseProgress } from "@/components/courses/CourseProgress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

type FilterOption = 'all' | 'in-progress' | 'completed' | 'not-started';

const filterOptions = [
  { id: 'all', label: 'Todos', icon: Book },
  { id: 'in-progress', label: 'Em Andamento', icon: Clock },
  { id: 'completed', label: 'Concluídos', icon: CheckCircle },
  { id: 'not-started', label: 'Não Iniciados', icon: Play },
];

const Courses = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    notStarted: 0
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCompany) return;
      
      setLoading(true);
      try {
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        // Fetch courses for company
        const { data: companyAccess } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (!companyAccess || companyAccess.length === 0) {
          setStats({ total: 0, inProgress: 0, completed: 0, notStarted: 0 });
          setRecentCourses([]);
          setLoading(false);
          return;
        }
        
        const courseIds = companyAccess.map(access => access.course_id);
        
        // Get user progress for these courses
        const { data: progressData } = await supabase
          .from('user_course_progress')
          .select('course_id, progress, completed, last_accessed')
          .eq('user_id', user.id)
          .in('course_id', courseIds);
        
        // Fetch all courses
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);
        
        const total = courseIds.length;
        const inProgress = progressData ? progressData.filter(p => p.progress > 0 && !p.completed).length : 0;
        const completed = progressData ? progressData.filter(p => p.completed).length : 0;
        const notStarted = total - inProgress - completed;
        
        setStats({
          total,
          inProgress,
          completed,
          notStarted
        });
        
        // Get recent courses
        const coursesWithProgress = coursesData?.map(course => {
          const progress = progressData?.find(p => p.course_id === course.id);
          return {
            ...course,
            progress: progress?.progress || 0,
            completed: progress?.completed || false,
            last_accessed: progress?.last_accessed || null
          };
        }) || [];
        
        // Sort by last accessed
        const sortedCourses = coursesWithProgress
          .filter(c => c.last_accessed)
          .sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime());
        
        setRecentCourses(sortedCourses.slice(0, 3));
      } catch (error) {
        console.error('Error fetching course stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [selectedCompany]);

  const getTitle = (baseTitle: string) => {
    return selectedCompany ? `${baseTitle} - ${selectedCompany.nome}` : baseTitle;
  };
  
  // Get company color for styling
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedCompany ? `Cursos da ${selectedCompany.nome}` : "Meus Cursos"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe seu progresso e explore todos os cursos disponíveis
          </p>
        </div>
        
        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : (
            <>
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total de Cursos</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Book className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Em Andamento</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.inProgress}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Concluídos</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.completed}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Não Iniciados</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.notStarted}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Play className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Continue Aprendendo</h2>
              <Button variant="ghost" onClick={() => navigate('/courses')} className="flex items-center gap-1 text-blue-600">
                Ver todos <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
                      onClick={() => navigate(`/courses/${course.id}`)}>
                  <div className="relative aspect-[16/9]">
                    <img 
                      src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2 line-clamp-2">{course.title}</h3>
                    <CourseProgress progress={course.progress} />
                  </CardContent>
                </Card>
              ))}
              
              {loading && Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          </div>
        )}
        
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isActive = activeFilter === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id as FilterOption)}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-full border text-sm transition-colors",
                  isActive
                    ? "border-transparent text-white"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
                style={isActive ? { 
                  backgroundColor: companyColor,
                  borderColor: companyColor 
                } : {}}
              >
                <Icon className="mr-2 h-4 w-4" />
                {option.label}
              </button>
            );
          })}
          
          {/* Additional filters could go here */}
          <button
            className="inline-flex items-center px-4 py-2 rounded-full border text-sm transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar - with company color */}
        <div className="relative h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ 
              backgroundColor: companyColor,
              width: activeFilter === 'all' ? '25%' : 
                    activeFilter === 'in-progress' ? '50%' : 
                    activeFilter === 'completed' ? '75%' : '100%' 
            }}
          />
        </div>
        
        {/* Course List */}
        <CourseList 
          title={getTitle(activeFilter === 'all' ? "Todos os Cursos" : 
                  activeFilter === 'in-progress' ? "Cursos em Andamento" : 
                  activeFilter === 'completed' ? "Cursos Concluídos" : "Cursos Não Iniciados")} 
          filter={activeFilter} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Courses;
