
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, BookPlus, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
}

interface LinkCoursesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  companyColor?: string;
  onCoursesLinked: () => void;
}

export const LinkCoursesDialog: React.FC<LinkCoursesDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  companyName,
  companyColor,
  onCoursesLinked
}) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingLinks, setExistingLinks] = useState<string[]>([]);

  // Use company color with fallback to purple
  const primaryColor = companyColor || "#9b87f5";
  
  // Fetch all courses and existing company-course relationships when dialog opens
  useEffect(() => {
    if (open && companyId) {
      fetchAllCoursesAndLinks();
    }
  }, [open, companyId]);

  const fetchAllCoursesAndLinks = async () => {
    setIsLoading(true);
    try {
      // Get user session to determine which courses they can access
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Get user profile to check if they're a super_admin
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('super_admin, is_admin')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      let coursesData;
      
      // Super admins can see all courses
      if (userProfile?.super_admin) {
        const { data, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('title');
          
        if (coursesError) throw coursesError;
        coursesData = data;
      } 
      // Regular admins can only see courses from companies they're an admin for
      else if (userProfile?.is_admin) {
        // First get all companies the user has access to
        const { data: userCompanies, error: companiesError } = await supabase
          .from('user_empresa')
          .select('empresa_id')
          .eq('user_id', userId);
          
        if (companiesError) throw companiesError;
        
        if (!userCompanies || userCompanies.length === 0) {
          setAllCourses([]);
          setIsLoading(false);
          return;
        }
        
        const companyIds = userCompanies.map(uc => uc.empresa_id);
        
        // Then get all course IDs from those companies
        const { data: companyCourses, error: coursesError } = await supabase
          .from('company_courses')
          .select('course_id')
          .in('empresa_id', companyIds);
          
        if (coursesError) throw coursesError;
        
        if (!companyCourses || companyCourses.length === 0) {
          setAllCourses([]);
          setIsLoading(false);
          return;
        }
        
        // Get unique course IDs
        const courseIds = [...new Set(companyCourses.map(cc => cc.course_id))];
        
        // Finally, get the actual course data
        const { data: courses, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds)
          .order('title');
          
        if (fetchError) throw fetchError;
        coursesData = courses;
      } else {
        // Regular users shouldn't see this dialog, but just in case
        setAllCourses([]);
        setIsLoading(false);
        return;
      }

      // Get existing course links for this company
      const { data: linksData, error: linksError } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', companyId);

      if (linksError) {
        throw linksError;
      }

      // Set the fetched courses and links
      setAllCourses(coursesData || []);
      const linkedCourseIds = (linksData || []).map(link => link.course_id);
      setExistingLinks(linkedCourseIds);
      
      // Pre-select existing links
      setSelectedCourses(linkedCourseIds);

    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Determine which links to add and which to remove
      const toAdd = selectedCourses.filter(id => !existingLinks.includes(id));
      const toRemove = existingLinks.filter(id => !selectedCourses.includes(id));

      // Remove unselected existing links
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('company_courses')
          .delete()
          .eq('empresa_id', companyId)
          .in('course_id', toRemove);

        if (removeError) throw removeError;
      }

      // Add new links
      if (toAdd.length > 0) {
        const newLinks = toAdd.map(courseId => ({
          empresa_id: companyId,
          course_id: courseId
        }));

        const { error: addError } = await supabase
          .from('company_courses')
          .insert(newLinks);

        if (addError) throw addError;
      }

      toast.success('Cursos vinculados com sucesso');
      onOpenChange(false);
      onCoursesLinked();

    } catch (error: any) {
      console.error('Error linking courses:', error);
      toast.error('Erro ao vincular cursos');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2" style={{ color: primaryColor }}>
            <BookPlus className="h-5 w-5" /> Vincular Cursos a {companyName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
          </div>
        ) : allCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum curso encontrado.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4 -mr-4">
            <div className="space-y-2">
              {allCourses.map(course => (
                <div
                  key={course.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCourses.includes(course.id)
                      ? 'border-[color:var(--company-color)] bg-[color:var(--company-bg)]'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleToggleCourse(course.id)}
                  style={{
                    ...(selectedCourses.includes(course.id) ? {
                      '--company-color': primaryColor,
                      '--company-bg': `${primaryColor}15`,
                      borderColor: primaryColor,
                      backgroundColor: `${primaryColor}15`
                    } : {})
                  } as React.CSSProperties}
                >
                  <div className="flex items-start gap-3">
                    {/* Course thumbnail */}
                    <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {course.image_url ? (
                        <img 
                          src={course.image_url} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookPlus className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium truncate">{course.title}</h3>
                      {course.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {course.description}
                        </p>
                      )}
                    </div>
                    
                    {selectedCourses.includes(course.id) && (
                      <Check className="h-5 w-5 flex-shrink-0" style={{ color: primaryColor }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading}
            style={{ backgroundColor: primaryColor }}
            className="hover:opacity-90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Vinculações'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
