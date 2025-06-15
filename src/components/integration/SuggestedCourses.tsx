
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, User } from "lucide-react";
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
      const { data, error } = await supabase
        .from('user_course_suggestions')
        .select(`
          *,
          course:courses(*),
          suggested_by_profile:profiles!user_course_suggestions_suggested_by_fkey(display_name)
        `)
        .eq('user_id', userProfile.id)
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suggested courses:', error);
        toast.error('Erro ao carregar cursos sugeridos');
        return;
      }

      setSuggestedCourses(data || []);
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
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Cursos Sugeridos</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Cursos recomendados especialmente para você
          </p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => setIsSuggestDialogOpen(true)}
            style={{ backgroundColor: companyColor }}
            className="text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Sugerir Curso
          </Button>
        )}
      </div>

      {suggestedCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum curso sugerido</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {isAdmin 
                ? "Ainda não há cursos sugeridos para este usuário. Que tal sugerir alguns?" 
                : "Ainda não há cursos sugeridos para você. Quando houver, aparecerão aqui!"
              }
            </p>
            {isAdmin && (
              <Button 
                onClick={() => setIsSuggestDialogOpen(true)}
                variant="outline"
                style={{ borderColor: companyColor, color: companyColor }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Sugerir Curso
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
