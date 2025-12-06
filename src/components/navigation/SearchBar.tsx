
import { Search } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface Course {
  id: string;
  title: string;
  image_url?: string;
  tags?: string[];
}

// Cache para cursos acessíveis por empresa
const coursesCache = new Map<string, { courses: Course[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const SearchBar = () => {
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isSchoolPage = location.pathname === '/my-courses';
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  
  // Usar refs para estabilizar dependências e evitar chamadas duplicadas
  const selectedCompanyIdRef = useRef<string | undefined>(selectedCompany?.id);
  const userProfileIdRef = useRef<string | undefined>(userProfile?.id);
  const lastFetchedKeyRef = useRef<string>('');
  
  useEffect(() => {
    selectedCompanyIdRef.current = selectedCompany?.id;
    userProfileIdRef.current = userProfile?.id;
  }, [selectedCompany?.id, userProfile?.id]);

  const fetchAccessibleCourses = useCallback(async () => {
    const companyId = selectedCompanyIdRef.current;
    const profileId = userProfileIdRef.current;
    
    if (!companyId || !profileId) {
      setCourses([]);
      return;
    }

    const cacheKey = `${companyId}-${profileId}`;
    
    // Evitar fetch duplicado para a mesma chave
    if (lastFetchedKeyRef.current === cacheKey && isFetchingRef.current) {
      return;
    }

    // Verificar cache primeiro
    const cached = coursesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setCourses(cached.courses);
      lastFetchedKeyRef.current = cacheKey;
      return;
    }

    // Evitar múltiplas requisições simultâneas
    if (isFetchingRef.current) {
      return;
    }
    
    lastFetchedKeyRef.current = cacheKey;

    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      // Get courses available to the company
      const { data: companyAccess, error: accessError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', companyId);
      
      // Tratamento específico para erro de recursão RLS
      if (accessError) {
        if (accessError.code === '42P17') {
          console.warn('[SearchBar] RLS recursion error detected, using fallback');
          // Fallback: tentar buscar cursos diretamente sem filtrar por empresa
          // ou usar cache se disponível
          if (cached) {
            setCourses(cached.courses);
            return;
          }
          // Se não tem cache, retornar vazio
          setCourses([]);
          return;
        }
        throw accessError;
      }
      
      if (!companyAccess || companyAccess.length === 0) {
        console.log("No courses found for this company");
        setCourses([]);
        return;
      }
      
      const courseIds = companyAccess.map(access => access.course_id);
      console.log('All company course IDs for search:', courseIds);
      
      // Get course job role restrictions
      const { data: courseJobRoles } = await supabase
        .from('course_job_roles')
        .select('course_id, job_role_id')
        .in('course_id', courseIds);
      
      console.log('Course job roles restrictions for search:', courseJobRoles);
      
      // Filter courses based on user's job role and admin status
      let accessibleCourseIds = courseIds;
      
      // Fetch user's company role data (is_admin and cargo_id are in user_empresa, not profile)
      // Also check super_admin status from profiles
      const [userCompanyResult, profileResult] = await Promise.all([
        supabase
          .from('user_empresa')
          .select('is_admin, cargo_id')
          .eq('user_id', profileId)
          .eq('empresa_id', companyId)
          .single(),
        supabase
          .from('profiles')
          .select('super_admin')
          .eq('id', profileId)
          .single()
      ]);
      
      const userCompany = userCompanyResult.data;
      const isSuperAdmin = profileResult.data?.super_admin === true;
      const isAdmin = isSuperAdmin || (userCompany?.is_admin === true);
      const userJobRoleId = userCompany?.cargo_id || null;
      
      // If user is not admin and has job role restrictions, apply filtering
      if (!isAdmin) {
        console.log('User job role ID for search:', userJobRoleId);
        
        if (courseJobRoles && courseJobRoles.length > 0) {
          // Get all courses that have role restrictions
          const restrictedCourseIds = [...new Set(courseJobRoles.map(cjr => cjr.course_id))];
          console.log('Courses with role restrictions for search:', restrictedCourseIds);
          
          // Get courses without any restrictions (available to all)
          const unrestrictedCourseIds = courseIds.filter(id => !restrictedCourseIds.includes(id));
          console.log('Unrestricted courses for search:', unrestrictedCourseIds);
          
          // Get courses that the user can access based on their job role
          let accessibleRestrictedCourses: string[] = [];
          if (userJobRoleId) {
            accessibleRestrictedCourses = courseJobRoles
              .filter(cjr => cjr.job_role_id === userJobRoleId)
              .map(cjr => cjr.course_id);
            console.log('Accessible restricted courses for user role in search:', accessibleRestrictedCourses);
          }
          
          // Combine unrestricted courses and accessible restricted courses
          accessibleCourseIds = [...unrestrictedCourseIds, ...accessibleRestrictedCourses];
        }
      }
      
      console.log('Final accessible course IDs for search:', accessibleCourseIds);
      
      if (accessibleCourseIds.length === 0) {
        console.log(`No accessible courses for user in search`);
        setCourses([]);
        return;
      }
      
      // Fetch the actual course data
      const { data: allCourses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, image_url, tags')
        .in('id', accessibleCourseIds);
      
      if (coursesError) throw coursesError;
      
      const finalCourses = allCourses || [];
      
      // Atualizar cache
      coursesCache.set(cacheKey, {
        courses: finalCourses,
        timestamp: Date.now()
      });
      
      setCourses(finalCourses);
    } catch (error: any) {
      console.error("Error fetching accessible courses for search:", error);
      
      // Se for erro de RLS, tentar usar cache se disponível
      if (error?.code === '42P17' && cached) {
        setCourses(cached.courses);
        return;
      }
      
      setCourses([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);
  
  useEffect(() => {
    const companyId = selectedCompany?.id;
    const profileId = userProfile?.id;
    
    // Não fazer fetch se não tiver company ou profile
    if (!companyId || !profileId) {
      setCourses([]);
      return;
    }
    
    // Limpar timeout anterior se existir
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    // Debounce: aguardar um pouco antes de buscar
    fetchTimeoutRef.current = setTimeout(() => {
      fetchAccessibleCourses();
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [selectedCompany?.id, userProfile?.id, fetchAccessibleCourses]);

  // Atalho de teclado Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detecta Cmd+K (Mac) ou Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return courses.filter(course => 
      course.title.toLowerCase().includes(query) ||
      (course.tags && course.tags.some(tag => tag.toLowerCase().includes(query)))
    ).slice(0, 5);
  }, [searchQuery, courses]);

  const handleSelect = (courseId: string) => {
    setOpen(false);
    navigate(`/courses/${courseId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setOpen(false);
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  // Detecta o sistema operacional para mostrar o atalho correto
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  // Mobile: apenas ícone
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#333333]"
        >
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>

        <CommandDialog 
          open={open} 
          onOpenChange={setOpen}
          className="search-dialog-position"
        >
          <div className="bg-white/95 dark:bg-[#222222] backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <Command className="rounded-lg border-none bg-transparent">
              <div className="flex flex-col">
                <DialogTitle className="sr-only">Pesquisar cursos</DialogTitle>
                <CommandInput 
                  value={searchQuery}
                  onValueChange={handleInputChange}
                  placeholder="Digite para pesquisar cursos..."
                  className="border-b border-gray-200 dark:border-[#333333]"
                  autoFocus
                />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  {loading && !filteredCourses.length ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                      Buscando cursos...
                    </div>
                  ) : searchQuery.trim() === "" ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                      Digite para pesquisar cursos
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <CommandEmpty>Nenhum curso encontrado.</CommandEmpty>
                  ) : (
                    <CommandGroup heading="Cursos disponíveis">
                      {filteredCourses.map((course) => (
                        <CommandItem
                          key={course.id}
                          onSelect={() => handleSelect(course.id)}
                          className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C2C]"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {course.image_url ? (
                              <img 
                                src={course.image_url} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{course.title}</div>
                            {course.tags && (
                              <div className="text-sm text-gray-500 truncate">
                                {course.tags.join(' • ')}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </div>
            </Command>
          </div>
        </CommandDialog>
      </>
    );
  }

  // Desktop: campo completo
  return (
    <>
      <div className={cn("relative", isSchoolPage ? "w-full" : "w-64")}>
        <div 
          className={cn(
            "flex items-center rounded-full bg-gray-50 dark:bg-[#191919] border border-gray-200 dark:border-[#333333] px-3 py-1 hover:border-gray-300 dark:hover:border-[#444444] transition-all cursor-pointer",
            "focus-within:ring-2 focus-within:ring-offset-0",
            "focus-within:ring-opacity-50"
          )}
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4 text-gray-400 dark:text-[#666666] mr-2 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full bg-transparent border-0 p-0 h-8 text-sm focus:outline-none"
            readOnly
          />
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            {isMac ? (
              <>
                <span className="text-xs">⌘</span>K
              </>
            ) : (
              <>Ctrl+K</>
            )}
          </kbd>
        </div>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        className="search-dialog-position"
      >
        <div className="bg-white/95 dark:bg-[#222222] backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg">
          <Command className="rounded-lg border-none bg-transparent">
            <div className="flex flex-col">
              <DialogTitle className="sr-only">Pesquisar cursos</DialogTitle>
              <CommandInput 
                value={searchQuery}
                onValueChange={handleInputChange}
                placeholder="Digite para pesquisar cursos..."
                className="border-b border-gray-200 dark:border-[#333333]"
                autoFocus
              />
              <CommandList className="max-h-[300px] overflow-y-auto">
                {loading && !filteredCourses.length ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    Buscando cursos...
                  </div>
                ) : searchQuery.trim() === "" ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    Digite para pesquisar cursos
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <CommandEmpty>Nenhum curso encontrado.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Cursos disponíveis">
                    {filteredCourses.map((course) => (
                      <CommandItem
                        key={course.id}
                        onSelect={() => handleSelect(course.id)}
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C2C]"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {course.image_url ? (
                            <img 
                              src={course.image_url} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{course.title}</div>
                          {course.tags && (
                            <div className="text-sm text-gray-500 truncate">
                              {course.tags.join(' • ')}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </div>
          </Command>
        </div>
      </CommandDialog>
    </>
  );
};
