
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { Book, Clock, CheckCircle, Star, ListCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CourseProgress } from "@/components/courses/CourseProgress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type FilterOption = 'favorites' | 'in-progress' | 'completed';

const MyCourses = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('favorites');
  const [stats, setStats] = useState({
    favorites: 0,
    inProgress: 0,
    completed: 0,
    videosCompleted: 2
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoursWatched, setHoursWatched] = useState(3.5);

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
          setStats({ favorites: 0, inProgress: 0, completed: 0, videosCompleted: 2 });
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
          completed,
          videosCompleted: 2 // Mock data
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
  
  // Mock data for chart
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-4">
        {/* Featured Course Hero */}
        <div className="rounded-lg overflow-hidden mb-8">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1617096199719-18e5acee65f8?auto=format&fit=crop&w=1200&q=80" 
              alt="Featured Course" 
              className="w-full h-[300px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-end p-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Como construir um bom fluxograma
                </h1>
                
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="bg-black/30 text-white border-none">
                    IA
                  </Badge>
                  <Badge variant="outline" className="bg-black/30 text-white border-none">
                    Ilustração
                  </Badge>
                  <Badge variant="outline" className="bg-black/30 text-white border-none">
                    Conceitos
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" 
                        alt="Pedro" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-white text-sm">Pedro</span>
                  </div>
                  
                  <Button className="bg-white text-black hover:bg-gray-100 gap-2">
                    Assistir agora
                    <div className="bg-black text-white rounded-full h-6 w-6 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 gap-3">
            <Button variant="outline" className="rounded-full px-4 py-2 bg-black text-white border-none hover:bg-gray-800">
              <ListCheck className="mr-2 h-4 w-4" />
              Todos
            </Button>
            <Button variant="outline" className="rounded-full px-4 py-2 bg-blue-600 text-white border-none hover:bg-blue-700">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="currentColor"/>
              </svg>
              3D
            </Button>
            <Button variant="outline" className="rounded-full px-4 py-2 bg-orange-400 text-white border-none hover:bg-orange-500">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 8h2v2h-2v-2zm-4 0h2v2H7v-2zm8 0h2v2h-2v-2z" fill="currentColor"/>
              </svg>
              Brand
            </Button>
            <Button variant="outline" className="rounded-full px-4 py-2 bg-green-400 text-white border-none hover:bg-green-500">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" fill="currentColor"/>
              </svg>
              Motion Design
            </Button>
            <Button variant="outline" className="rounded-full px-4 py-2 bg-red-400 text-white border-none hover:bg-red-500">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" fill="currentColor"/>
                <path d="M15 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" fill="currentColor"/>
              </svg>
              Design
            </Button>
            <Button variant="outline" className="rounded-full px-4 py-2 bg-yellow-400 text-white border-none hover:bg-yellow-500">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
              </svg>
              Planejamento
            </Button>
          </div>
        </div>
        
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
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
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">IA</Badge>
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">Ilustração</Badge>
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-2">conceitos</Badge>
                        </div>
                        
                        <h3 className="font-medium mb-2 line-clamp-2">
                          Criar um Personagem do Zero
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
                  <p className="text-gray-500 col-span-3">Nenhum curso recente encontrado.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Video stats card */}
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Vídeos completos</h3>
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
                    {months.map((month, idx) => {
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
