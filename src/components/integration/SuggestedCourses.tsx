import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { SuggestCourseDialog } from './suggested-courses/SuggestCourseDialog';
import { SuggestedCourseCard } from './suggested-courses/SuggestedCourseCard';
import { SuggestedCoursesSkeleton } from './suggested-courses/SuggestedCoursesSkeleton';

interface SuggestedCourse {
  id: string;
  course_id: string;
  user_id: string;
  suggested_by: string;
  reason: string;
  created_at: string;
  order_index?: number;
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    instructor: string;
    tags: string[];
  };
  suggested_by_profile: {
    display_name: string;
  };
}

interface SuggestedCoursesProps {
  companyColor: string;
}

export const SuggestedCourses: React.FC<SuggestedCoursesProps> = ({ companyColor }) => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const [suggestedCourses, setSuggestedCourses] = useState<SuggestedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  const fetchSuggestedCourses = async () => {
    if (!userProfile?.id || !selectedCompany?.id) return;
    
    setIsLoading(true);
    try {
      console.log('[SuggestedCourses] Fetching suggestions for user:', userProfile.id, 'company:', selectedCompany.id);
      
      // Buscar as sugestões ordenadas pelo order_index definido pelo admin
      // Usar order_index primeiro, depois created_at como fallback
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('user_course_suggestions')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', userProfile.id)
        .eq('company_id', selectedCompany.id)
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (suggestionsError) {
        console.error('Error fetching course suggestions:', suggestionsError);
        toast.error('Erro ao carregar cursos sugeridos');
        return;
      }

      if (!suggestions || suggestions.length === 0) {
        console.log('[SuggestedCourses] No suggestions found for this user/company');
        setSuggestedCourses([]);
        return;
      }

      console.log('[SuggestedCourses] Raw suggestions from DB (ordered):', suggestions.map(s => ({ 
        id: s.id, 
        order_index: s.order_index, 
        course_title: s.course?.title,
        created_at: s.created_at
      })));

      const suggesterIds = suggestions.map(s => s.suggested_by);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', suggesterIds);

      if (profilesError) {
        console.error('Error fetching suggester profiles:', profilesError);
        toast.error('Erro ao carregar informações dos sugestores');
        return;
      }

      // Enriquecer com perfis dos sugestores e manter a ordem do banco
      const enrichedSuggestions = suggestions.map(suggestion => {
        const suggesterProfile = profiles?.find(p => p.id === suggestion.suggested_by);
        return {
          ...suggestion,
          suggested_by_profile: {
            display_name: suggesterProfile?.display_name || 'Usuário desconhecido'
          }
        };
      });

      console.log('[SuggestedCourses] Final suggestions (maintaining DB order):', enrichedSuggestions.map(s => ({ 
        course_title: s.course?.title, 
        order_index: s.order_index,
        created_at: s.created_at
      })));
      
      setSuggestedCourses(enrichedSuggestions);
    } catch (error) {
      console.error('Error fetching suggested courses:', error);
      toast.error('Erro ao carregar cursos sugeridos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('user_course_suggestions')
        .delete()
        .eq('id', suggestionId);

      if (error) {
        console.error('Error removing suggestion:', error);
        toast.error('Erro ao remover sugestão');
        return;
      }

      toast.success('Sugestão removida com sucesso');
      fetchSuggestedCourses();
    } catch (error) {
      console.error('Error removing suggestion:', error);
      toast.error('Erro ao remover sugestão');
    }
  };

  useEffect(() => {
    fetchSuggestedCourses();
  }, [userProfile?.id, selectedCompany?.id]);

  if (isLoading) {
    return <SuggestedCoursesSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8">
      <div className="space-y-8">
        {/* Header mais minimal */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            Cursos Sugeridos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Recomendações especiais para você
          </p>
        </div>

        {/* Action button - só aparece se for admin */}
        {isAdmin && (
          <div className="flex justify-center">
            <Button 
              onClick={() => setIsSuggestDialogOpen(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sugerir Curso
            </Button>
          </div>
        )}

        {/* Courses grid */}
        {suggestedCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nenhum curso sugerido
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              {isAdmin 
                ? "Ainda não há cursos sugeridos para este usuário. Use o botão acima para sugerir alguns!" 
                : "Ainda não há cursos sugeridos para você. Quando houver, aparecerão aqui!"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {suggestedCourses.map((suggestion) => (
              <SuggestedCourseCard
                key={suggestion.id}
                suggestion={suggestion}
                companyColor={companyColor}
                onRemove={handleRemoveSuggestion}
                canRemove={isAdmin}
              />
            ))}
          </div>
        )}

        <SuggestCourseDialog
          open={isSuggestDialogOpen}
          onOpenChange={setIsSuggestDialogOpen}
          companyId={selectedCompany?.id || ''}
          companyColor={companyColor}
          onCourseSuggested={fetchSuggestedCourses}
        />
      </div>
    </div>
  );
};
