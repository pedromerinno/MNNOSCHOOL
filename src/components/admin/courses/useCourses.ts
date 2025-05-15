
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Course } from './types';
import { fetchCourses, deleteCourse } from '@/services/course';
import { useCourseForm } from '@/hooks/useCourseForm';
import { useCompanyCoursesManager } from '@/hooks/useCompanyCoursesManager';
import { supabase } from "@/integrations/supabase/client";

export const useCourses = (companyId?: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs para otimização de performance
  const courseCache = useRef<Map<string, {courses: Course[], timestamp: number}>>(new Map());
  const fetchInProgress = useRef(false);
  const lastFetchTime = useRef<number>(0);
  
  // Tempo de expiração do cache: 5 minutos
  const CACHE_EXPIRATION = 5 * 60 * 1000;

  const { 
    selectedCourse, 
    setSelectedCourse, 
    isFormOpen, 
    setIsFormOpen, 
    isSubmitting, 
    handleFormSubmit 
  } = useCourseForm(() => loadCourses());

  const { 
    isCompanyManagerOpen, 
    setIsCompanyManagerOpen 
  } = useCompanyCoursesManager();

  const getCoursesFromCache = (cacheKey: string): Course[] | null => {
    const cached = courseCache.current.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_EXPIRATION) {
      courseCache.current.delete(cacheKey);
      return null;
    }
    
    return cached.courses;
  };
  
  const saveCoursesToCache = (cacheKey: string, data: Course[]) => {
    courseCache.current.set(cacheKey, {
      courses: data,
      timestamp: Date.now()
    });
  };

  const loadCourses = async (forceRefresh: boolean = false) => {
    // Evitar múltiplas chamadas simultâneas
    if (fetchInProgress.current) {
      console.log('Uma busca de cursos já está em andamento, ignorando duplicação');
      return;
    }
    
    // Throttling de requisições
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime.current < 1000) {
      console.log('Requisição muito frequente, usando dados existentes');
      return;
    }
    
    const cacheKey = companyId || 'all_courses';
    
    // Usar cache se disponível e não for um refresh forçado
    if (!forceRefresh) {
      const cachedCourses = getCoursesFromCache(cacheKey);
      if (cachedCourses) {
        console.log(`Usando ${cachedCourses.length} cursos em cache para ${cacheKey}`);
        setCourses(cachedCourses);
        if (!isLoading) return;
      }
    }
    
    setIsLoading(true);
    fetchInProgress.current = true;
    
    try {
      console.log('Loading courses with companyId:', companyId || 'none');
      
      if (companyId) {
        // Se companyId for fornecido, buscar cursos diretamente para essa empresa
        const companySpecificCourses = await fetchCourses(companyId);
        console.log(`Fetched ${companySpecificCourses.length} courses for company ${companyId}`);
        setCourses(companySpecificCourses);
        saveCoursesToCache(cacheKey, companySpecificCourses);
      } else {
        // Se não houver companyId, seguir a lógica baseada em papéis
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;

        if (!currentUserId) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        // Usar cache em LocalStorage para perfil de usuário
        let currentUserProfile;
        const cachedProfileKey = `user_profile_${currentUserId}`;
        const cachedProfile = localStorage.getItem(cachedProfileKey);
        
        if (cachedProfile && !forceRefresh) {
          try {
            const { data, timestamp } = JSON.parse(cachedProfile);
            if (Date.now() - timestamp < CACHE_EXPIRATION) {
              currentUserProfile = data;
              console.log('Usando perfil de usuário em cache');
            }
          } catch (e) {
            console.error('Erro ao processar perfil em cache:', e);
          }
        }
        
        // Se não tiver cache válido, buscar do servidor
        if (!currentUserProfile) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, super_admin')
            .eq('id', currentUserId)
            .single();
            
          currentUserProfile = profile;
          
          // Salvar em cache
          try {
            localStorage.setItem(cachedProfileKey, JSON.stringify({
              data: profile,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.error('Erro ao cachear perfil:', e);
          }
        }

        if (currentUserProfile?.super_admin) {
          // Super admins veem todos os cursos se não houver companyId
          const fetchedCourses = await fetchCourses();
          setCourses(fetchedCourses);
          saveCoursesToCache(cacheKey, fetchedCourses);
        } else if (currentUserProfile?.is_admin) {
          // Admins regulares veem cursos das suas empresas
          
          // Tentar usar cache para empresas do usuário
          const userCompaniesKey = `user_companies_${currentUserId}`;
          let userCompanies;
          const cachedUserCompanies = localStorage.getItem(userCompaniesKey);
          
          if (cachedUserCompanies && !forceRefresh) {
            try {
              const { data, timestamp } = JSON.parse(cachedUserCompanies);
              if (Date.now() - timestamp < CACHE_EXPIRATION) {
                userCompanies = data;
                console.log('Usando empresas do usuário em cache');
              }
            } catch (e) {
              console.error('Erro ao processar empresas em cache:', e);
            }
          }
          
          if (!userCompanies) {
            const { data } = await supabase
              .from('user_empresa')
              .select('empresa_id')
              .eq('user_id', currentUserId);
              
            userCompanies = data;
            
            // Salvar em cache
            try {
              localStorage.setItem(userCompaniesKey, JSON.stringify({
                data,
                timestamp: Date.now()
              }));
            } catch (e) {
              console.error('Erro ao cachear empresas do usuário:', e);
            }
          }

          if (!userCompanies?.length) {
            setCourses([]);
            setIsLoading(false);
            return;
          }

          const companyIds = userCompanies.map(uc => uc.empresa_id);
          
          // Tentar usar cache para cursos das empresas
          const companyCourseKey = `company_courses_${companyIds.join('_')}`;
          let companyCourses;
          const cachedCompanyCourses = localStorage.getItem(companyCourseKey);
          
          if (cachedCompanyCourses && !forceRefresh) {
            try {
              const { data, timestamp } = JSON.parse(cachedCompanyCourses);
              if (Date.now() - timestamp < CACHE_EXPIRATION) {
                companyCourses = data;
                console.log('Usando cursos das empresas em cache');
              }
            } catch (e) {
              console.error('Erro ao processar cursos das empresas em cache:', e);
            }
          }
          
          if (!companyCourses) {
            const { data } = await supabase
              .from('company_courses')
              .select('course_id')
              .in('empresa_id', companyIds);
              
            companyCourses = data;
            
            // Salvar em cache
            try {
              localStorage.setItem(companyCourseKey, JSON.stringify({
                data,
                timestamp: Date.now()
              }));
            } catch (e) {
              console.error('Erro ao cachear cursos das empresas:', e);
            }
          }

          if (!companyCourses?.length) {
            setCourses([]);
            setIsLoading(false);
            return;
          }

          const courseIds = [...new Set(companyCourses.map(cc => cc.course_id))];
          
          // Buscar cursos específicos
          const { data: courses } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds);

          setCourses(courses || []);
          saveCoursesToCache(cacheKey, courses || []);
        } else {
          // Usuários não-admin não veem cursos
          setCourses([]);
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
      lastFetchTime.current = Date.now();
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      const success = await deleteCourse(courseId);
      if (success) {
        // Limpar cache após deleção
        courseCache.current.clear();
        loadCourses(true); // Força refresh após deleção
      }
    }
  };

  useEffect(() => {
    const handleSettingsCompanyChange = (e: CustomEvent) => {
      if (e.detail?.company?.id) {
        console.log(`Company changed in settings, updating courses for: ${e.detail.company.nome}`);
        setIsFormOpen(false);
        setIsCompanyManagerOpen(false);
        setSelectedCourse(null);
        
        // Limpar cache e forçar reload quando a empresa for alterada
        courseCache.current.clear();
        loadCourses(true);
      }
    };

    window.addEventListener('settings-company-changed', handleSettingsCompanyChange as EventListener);
    
    return () => {
      window.removeEventListener('settings-company-changed', handleSettingsCompanyChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleCourseDeleted = (e: CustomEvent) => {
      console.log('Course deleted event received, refreshing courses list');
      // Limpar cache e forçar reload quando um curso for excluído
      courseCache.current.clear();
      loadCourses(true);
    };

    window.addEventListener('course-deleted', handleCourseDeleted as EventListener);
    
    return () => {
      window.removeEventListener('course-deleted', handleCourseDeleted as EventListener);
    };
  }, []);

  useEffect(() => {
    loadCourses();
  }, [companyId]); 

  return {
    courses,
    isLoading,
    selectedCourse,
    setSelectedCourse,
    isFormOpen,
    setIsFormOpen,
    isCompanyManagerOpen,
    setIsCompanyManagerOpen,
    isSubmitting,
    fetchCourses: () => loadCourses(true), // Expor método para forçar refresh
    handleDeleteCourse,
    handleFormSubmit
  };
};
