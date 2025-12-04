import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

export interface SuggestedTopic {
  name: string;
  color: string;
}

const TOPIC_COLORS = [
  "#F5FCE1", // Light yellow-green
  "#DBF5E4", // Light green
  "#E4ECFF", // Light blue
  "#FFF6C9", // Light yellow
  "#F0E6FF", // Light purple
  "#FFE6E6", // Light pink
  "#E6F3FF", // Light sky blue
  "#FFF0E6", // Light orange
];

export const useSuggestedTopics = () => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const lastUserIdRef = useRef<string | null>(null);
  const lastCompanyIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Evitar fetch se os IDs não mudaram
    const userId = userProfile?.id;
    const companyId = selectedCompany?.id;
    
    if (userId === lastUserIdRef.current && companyId === lastCompanyIdRef.current && suggestedTopics.length > 0) {
      return;
    }
    
    lastUserIdRef.current = userId || null;
    lastCompanyIdRef.current = companyId || null;
    const fetchSuggestedTopics = async () => {
      if (!userProfile?.id || !selectedCompany?.id) {
        setSuggestedTopics([]);
        setLoading(false);
        return;
      }

      try {
        // Buscar tags dos cursos sugeridos para o usuário
        const { data: suggestions, error: suggestionsError } = await supabase
          .from('user_course_suggestions')
          .select(`
            course:courses(
              tags
            )
          `)
          .eq('user_id', userProfile.id)
          .eq('company_id', selectedCompany.id)
          .limit(10);

        if (suggestionsError) {
          console.error('Error fetching suggested courses for topics:', suggestionsError);
        }

        // Buscar tags dos cursos disponíveis na empresa (não completados pelo usuário)
        const { data: companyCourses } = await supabase
          .from('company_courses')
          .select(`
            course:courses(
              id,
              tags
            )
          `)
          .eq('empresa_id', selectedCompany.id);

        // Buscar cursos completados pelo usuário para excluir
        const { data: completedProgress } = await supabase
          .from('user_course_progress')
          .select('course_id')
          .eq('user_id', userProfile.id)
          .eq('completed', true);

        const completedCourseIds = new Set(completedProgress?.map(p => p.course_id) || []);

        // Coletar todas as tags únicas
        const allTags = new Map<string, number>(); // tag -> count

        // Adicionar tags dos cursos sugeridos (peso maior)
        suggestions?.forEach((suggestion: any) => {
          if (suggestion.course?.tags && Array.isArray(suggestion.course.tags)) {
            suggestion.course.tags.forEach((tag: string) => {
              const normalizedTag = tag.trim();
              if (normalizedTag) {
                allTags.set(normalizedTag, (allTags.get(normalizedTag) || 0) + 3); // Peso 3 para sugeridos
              }
            });
          }
        });

        // Adicionar tags dos cursos disponíveis não completados (peso menor)
        companyCourses?.forEach((cc: any) => {
          if (cc.course?.tags && Array.isArray(cc.course.tags) && !completedCourseIds.has(cc.course.id)) {
            cc.course.tags.forEach((tag: string) => {
              const normalizedTag = tag.trim();
              if (normalizedTag) {
                allTags.set(normalizedTag, (allTags.get(normalizedTag) || 0) + 1); // Peso 1 para disponíveis
              }
            });
          }
        });

        // Ordenar por frequência e pegar os top 2-4 temas
        const sortedTags = Array.from(allTags.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([tag], index) => ({
            name: tag,
            color: TOPIC_COLORS[index % TOPIC_COLORS.length],
          }));

        setSuggestedTopics(sortedTags);
      } catch (error) {
        console.error('Error fetching suggested topics:', error);
        setSuggestedTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedTopics();
  }, [userProfile?.id, selectedCompany?.id]);

  return { suggestedTopics, loading };
};

