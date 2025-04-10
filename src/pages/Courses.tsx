
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseList } from "@/components/courses/CourseList";
import { useCompanies } from "@/hooks/useCompanies";
import { Book, Filter, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { RecentCourses } from "@/components/courses/RecentCourses";

type FilterOption = 'all' | 'newest' | 'popular';

const Courses = () => {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [featuredCourse, setFeaturedCourse] = useState<any>(null);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);

  // Get company color for styling
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  useEffect(() => {
    const fetchFeaturedCourse = async () => {
      if (!selectedCompany) return;
      
      try {
        setLoading(true);
        
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        // Fetch courses for company
        const { data: companyAccess } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (!companyAccess || companyAccess.length === 0) {
          setLoading(false);
          return;
        }
        
        const courseIds = companyAccess.map(access => access.course_id);
        
        // Get a random featured course (in a real app, this would be based on criteria)
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds)
          .limit(1);
        
        if (coursesData && coursesData.length > 0) {
          setFeaturedCourse(coursesData[0]);
        }
      } catch (error) {
        console.error('Error fetching featured course:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRecentCourses = async () => {
      if (!selectedCompany) return;
      
      try {
        setRecentLoading(true);
        
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        // Get user's course progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('course_id, progress, completed, favorite, last_accessed')
          .eq('user_id', user.id)
          .order('last_accessed', { ascending: false })
          .limit(3);
          
        if (progressError) {
          throw progressError;
        }
        
        if (!progressData || progressData.length === 0) {
          setRecentCourses([]);
          setRecentLoading(false);
          return;
        }
        
        // Get courses from the progress data
        const courseIds = progressData.map(item => item.course_id);
        
        // Fetch courses for company
        const { data: companyAccess } = await supabase
          .from('company_courses')
          .select('course_id')
          .eq('empresa_id', selectedCompany.id);
        
        if (!companyAccess || companyAccess.length === 0) {
          setRecentCourses([]);
          setRecentLoading(false);
          return;
        }
        
        const accessibleCourseIds = companyAccess.map(access => access.course_id);
        
        // Filter course IDs to only include those accessible to the company
        const filteredCourseIds = courseIds.filter(id => 
          accessibleCourseIds.includes(id)
        );
        
        if (filteredCourseIds.length === 0) {
          setRecentCourses([]);
          setRecentLoading(false);
          return;
        }
        
        // Get the course details
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', filteredCourseIds);
          
        if (!coursesData || coursesData.length === 0) {
          setRecentCourses([]);
          setRecentLoading(false);
          return;
        }
        
        // Merge course data with progress data
        const coursesWithProgress = coursesData.map(course => {
          const progress = progressData.find(p => p.course_id === course.id);
          return {
            ...course,
            progress: progress?.progress || 0,
            completed: progress?.completed || false,
            favorite: progress?.favorite || false
          };
        });
        
        // Sort by last accessed
        coursesWithProgress.sort((a, b) => {
          const progressA = progressData.find(p => p.course_id === a.id);
          const progressB = progressData.find(p => p.course_id === b.id);
          
          if (!progressA?.last_accessed) return 1;
          if (!progressB?.last_accessed) return -1;
          
          return new Date(progressB.last_accessed).getTime() - 
                 new Date(progressA.last_accessed).getTime();
        });
        
        setRecentCourses(coursesWithProgress);
      } catch (error) {
        console.error('Error fetching recent courses:', error);
      } finally {
        setRecentLoading(false);
      }
    };
    
    fetchFeaturedCourse();
    fetchRecentCourses();
  }, [selectedCompany]);

  const getTitle = () => {
    return selectedCompany 
      ? `Todos os Cursos - ${selectedCompany.nome}` 
      : "Todos os Cursos";
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-screen-2xl space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore todos os cursos disponíveis para sua empresa
          </p>
        </div>
        
        {/* Featured Course Hero - Updated to match new design */}
        {featuredCourse && (
          <div className="rounded-2xl overflow-hidden mb-8 bg-[#1A1F2C]">
            <div className="relative">
              <div className="flex flex-col md:flex-row">
                {/* Left content section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                      {featuredCourse.title}
                    </h1>
                    
                    <div className="flex gap-2 mb-8">
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
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center">
                    {/* Instructor avatar and name */}
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                      <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-lg font-medium overflow-hidden">
                        {featuredCourse.instructor ? (
                          <img 
                            src={`https://i.pravatar.cc/100?u=${featuredCourse.instructor}`} 
                            alt={featuredCourse.instructor}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>P</span>
                        )}
                      </div>
                      <span className="text-white">{featuredCourse.instructor || "Pedro"}</span>
                    </div>
                    
                    {/* Watch now button */}
                    <Button 
                      className="bg-white text-black hover:bg-gray-100 rounded-full gap-2 px-6"
                      onClick={() => window.location.href = `/courses/${featuredCourse.id}`}
                    >
                      Assistir agora
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Right image section with overlay */}
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1A1F2C] via-transparent to-transparent z-10 md:block hidden"></div>
                  <img 
                    src={featuredCourse.image_url || "https://images.unsplash.com/photo-1617096199719-18e5acee65f8?auto=format&fit=crop&w=1200&q=80"} 
                    alt={featuredCourse.title} 
                    className="w-full h-full object-cover min-h-[300px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Courses Section */}
        {recentCourses.length > 0 && (
          <RecentCourses 
            courses={recentCourses} 
            loading={recentLoading} 
            companyColor={companyColor} 
          />
        )}
        
        {/* Header with filter */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center space-x-2">
            <Book className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Catálogo de Cursos</h2>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setActiveFilter('all')}>
                Todos os Cursos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('newest')}>
                Mais Recentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('popular')}>
                Mais Populares
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Course List */}
        <CourseList 
          title="" 
          filter="all" 
        />
      </div>
    </DashboardLayout>
  );
};

export default Courses;
