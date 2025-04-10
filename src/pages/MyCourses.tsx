
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { Book, Clock, CheckCircle, Star, ListChecked } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CourseProgress } from "@/components/courses/CourseProgress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterOption = 'favorites' | 'in-progress' | 'completed';

const filterOptions = [
  { id: 'favorites', label: 'Favoritos', icon: Star },
  { id: 'in-progress', label: 'Em Andamento', icon: Clock },
  { id: 'completed', label: 'Concluídos', icon: CheckCircle },
];

const MyCourses = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('favorites');
  const [stats, setStats] = useState({
    favorites: 0,
    inProgress: 0,
    completed: 0
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
          setStats({ favorites: 0, inProgress: 0, completed: 0 });
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
        
        // Currently we don't have favorites in the database, so we'll mock it
        // In a real implementation, you would fetch this from a favorites table
        const inProgress = progressData ? progressData.filter(p => p.progress > 0 && !p.completed).length : 0;
        const completed = progressData ? progressData.filter(p => p.completed).length : 0;
        const favorites = Math.min(5, courseIds.length); // Mock data: assume 5 favorites or less if fewer courses
        
        setStats({
          favorites,
          inProgress,
          completed
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

  // Get company color for styling
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meus Cursos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe seus cursos favoritos e seu progresso de aprendizagem
          </p>
        </div>
        
        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : (
            <>
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Favoritos</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.favorites}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Star className="h-6 w-6 text-amber-600" />
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
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
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
            </>
          )}
        </div>
        
        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Continue Aprendendo</h2>
              <Button variant="ghost" onClick={() => setActiveFilter('in-progress')} className="flex items-center gap-1 text-blue-600">
                Ver todos
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
        
        {/* Tabs for different course categories */}
        <Tabs defaultValue="favorites" onValueChange={(value) => setActiveFilter(value as FilterOption)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="favorites" style={{ 
              color: activeFilter === 'favorites' ? '#fff' : undefined, 
              backgroundColor: activeFilter === 'favorites' ? companyColor : undefined
            }}>
              <Star className="h-4 w-4 mr-2" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="in-progress" style={{ 
              color: activeFilter === 'in-progress' ? '#fff' : undefined, 
              backgroundColor: activeFilter === 'in-progress' ? companyColor : undefined
            }}>
              <Clock className="h-4 w-4 mr-2" />
              Em Andamento
            </TabsTrigger>
            <TabsTrigger value="completed" style={{ 
              color: activeFilter === 'completed' ? '#fff' : undefined, 
              backgroundColor: activeFilter === 'completed' ? companyColor : undefined
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluídos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites">
            <CourseList 
              title="Cursos Favoritos" 
              filter="all" 
            />
          </TabsContent>
          <TabsContent value="in-progress">
            <CourseList 
              title="Cursos em Andamento" 
              filter="in-progress" 
            />
          </TabsContent>
          <TabsContent value="completed">
            <CourseList 
              title="Cursos Concluídos" 
              filter="completed" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
