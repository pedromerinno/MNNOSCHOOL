
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

type FilterOption = 'all' | 'newest' | 'popular';

const Courses = () => {
  const { selectedCompany } = useCompanies();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [featuredCourse, setFeaturedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    
    fetchFeaturedCourse();
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
        
        {/* Featured Course Hero */}
        {featuredCourse && (
          <div className="rounded-lg overflow-hidden mb-8">
            <div className="relative">
              <img 
                src={featuredCourse.image_url || "https://images.unsplash.com/photo-1617096199719-18e5acee65f8?auto=format&fit=crop&w=1200&q=80"} 
                alt={featuredCourse.title} 
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-end p-8">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {featuredCourse.title}
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
                          src={`https://i.pravatar.cc/100?u=${featuredCourse.instructor}`} 
                          alt={featuredCourse.instructor || "Instrutor"} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-white text-sm">{featuredCourse.instructor || "Instrutor"}</span>
                    </div>
                    
                    <Button 
                      className="bg-white text-black hover:bg-gray-100 gap-2"
                      onClick={() => window.location.href = `/courses/${featuredCourse.id}`}
                    >
                      Assistir agora
                      <div className="bg-black text-white rounded-full h-6 w-6 flex items-center justify-center">
                        <Play size={12} />
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Header with filter */}
        <div className="flex justify-between items-center">
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
