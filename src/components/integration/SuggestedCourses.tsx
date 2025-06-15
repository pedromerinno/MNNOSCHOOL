import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, User, Star, Clock, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { SuggestCourseDialog } from './suggested-courses/SuggestCourseDialog';
import { SuggestedCourseCard } from './suggested-courses/SuggestedCourseCard';

interface SuggestedCourse {
  id: string;
  course_id: string;
  user_id: string;
  suggested_by: string;
  reason: string;
  created_at: string;
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
      // Primeiro, buscar as sugestões básicas
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('user_course_suggestions')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', userProfile.id)
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (suggestionsError) {
        console.error('Error fetching course suggestions:', suggestionsError);
        toast.error('Erro ao carregar cursos sugeridos');
        return;
      }

      if (!suggestions || suggestions.length === 0) {
        setSuggestedCourses([]);
        return;
      }

      // Buscar os perfis dos usuários que sugeriram os cursos
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

      // Combinar os dados
      const enrichedSuggestions = suggestions.map(suggestion => {
        const suggesterProfile = profiles?.find(p => p.id === suggestion.suggested_by);
        return {
          ...suggestion,
          suggested_by_profile: {
            display_name: suggesterProfile?.display_name || 'Usuário desconhecido'
          }
        };
      });

      console.log(`Loaded ${enrichedSuggestions.length} course suggestions`);
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
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-3 border-gray-200 border-t-primary rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Carregando cursos sugeridos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-2xl text-white shadow-lg"
                  style={{ backgroundColor: companyColor }}
                >
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Cursos Sugeridos
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Recomendações personalizadas para o seu desenvolvimento
                  </p>
                </div>
              </div>
              
              {suggestedCourses.length > 0 && (
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" style={{ color: companyColor }} />
                    <span>{suggestedCourses.length} curso{suggestedCourses.length !== 1 ? 's' : ''} sugerido{suggestedCourses.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: companyColor }} />
                    <span>Atualizados recentemente</span>
                  </div>
                </div>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => setIsSuggestDialogOpen(true)}
                  size="lg"
                  className="text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  style={{ backgroundColor: companyColor }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Sugerir Curso
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      {suggestedCourses.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
          <CardContent className="py-16 px-8 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div 
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${companyColor}15` }}
              >
                <BookOpen className="h-10 w-10" style={{ color: companyColor }} />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Nenhum curso sugerido ainda
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  {isAdmin 
                    ? "Que tal começar sugerindo alguns cursos para enriquecer a jornada de aprendizado?" 
                    : "Quando houver cursos recomendados especialmente para você, eles aparecerão aqui!"
                  }
                </p>
              </div>
              
              {isAdmin && (
                <Button 
                  onClick={() => setIsSuggestDialogOpen(true)}
                  variant="outline"
                  size="lg"
                  className="mt-6 border-2 hover:bg-opacity-10 transition-all duration-200"
                  style={{ 
                    borderColor: companyColor, 
                    color: companyColor,
                    backgroundColor: 'transparent'
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Sugerir Primeiro Curso
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
  );
};
