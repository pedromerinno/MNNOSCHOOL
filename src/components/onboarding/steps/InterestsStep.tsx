
import React, { useState, useEffect } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InterestsStepProps {
  onBack: () => void;
}

const InterestsStep: React.FC<InterestsStepProps> = ({ onBack }) => {
  const { profileData, updateProfileData, saveProfileData, isLoading } = useOnboarding();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profileData.interests || []);
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  useEffect(() => {
    const fetchCourseTags = async () => {
      try {
        setIsLoadingTags(true);
        
        // Se tivermos uma empresa selecionada no profileData
        if (profileData.companyId) {
          console.log("Buscando tags para empresa ID:", profileData.companyId);
          
          // Primeiro pegamos os IDs dos cursos da empresa
          const { data: companyCourses, error: coursesError } = await supabase
            .from('company_courses')
            .select('course_id')
            .eq('empresa_id', profileData.companyId);
            
          if (coursesError) throw coursesError;
          
          if (!companyCourses || companyCourses.length === 0) {
            console.log("Nenhum curso encontrado para esta empresa, usando tags padrão");
            setAvailableInterests(['Tecnologia', 'Negócios', 'Liderança', 'Marketing', 'Inovação']);
            setIsLoadingTags(false);
            return;
          }
          
          const courseIds = companyCourses.map(cc => cc.course_id);
          console.log("IDs de cursos encontrados:", courseIds);
          
          // Agora buscamos as tags de todos os cursos da empresa
          const { data: courses, error: tagsError } = await supabase
            .from('courses')
            .select('tags')
            .in('id', courseIds);
            
          if (tagsError) throw tagsError;
          
          // Extrair todas as tags únicas dos cursos
          const allTags = courses.flatMap(course => course.tags || []);
          const uniqueTags = Array.from(new Set(
            allTags.filter(tag => tag) // Remove null/undefined
          ));
          
          console.log("Tags únicas encontradas:", uniqueTags);
          
          if (uniqueTags.length > 0) {
            setAvailableInterests(uniqueTags);
          } else {
            console.log("Nenhuma tag encontrada nos cursos, usando tags padrão");
            setAvailableInterests(['Tecnologia', 'Negócios', 'Liderança', 'Marketing', 'Inovação']);
          }
        } else {
          // Se não temos empresa, usamos tags padrão
          console.log("Nenhuma empresa selecionada, usando tags padrão");
          setAvailableInterests(['Tecnologia', 'Negócios', 'Liderança', 'Marketing', 'Inovação']);
        }
      } catch (error: any) {
        console.error('Erro ao buscar tags:', error);
        toast.error("Erro ao carregar interesses disponíveis");
        // Usar tags padrão em caso de erro
        setAvailableInterests(['Tecnologia', 'Negócios', 'Liderança', 'Marketing', 'Inovação']);
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchCourseTags();
  }, [profileData.companyId]);

  const handleInterestToggle = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newInterests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedInterests.length === 0) {
      setError("Por favor, selecione pelo menos um interesse");
      return;
    }
    
    updateProfileData({ interests: selectedInterests });
    await saveProfileData();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Seus interesses</h2>
        <p className="text-gray-500 text-sm">
          Selecione os tópicos que mais interessam você para personalizarmos sua experiência.
        </p>
      </div>
      
      {isLoadingTags ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className="h-12 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableInterests.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => handleInterestToggle(interest)}
              className={`
                px-4 py-3 rounded-lg text-sm flex items-center justify-between
                transition-colors duration-200 border
                ${selectedInterests.includes(interest) 
                  ? 'bg-merinno-dark text-white border-merinno-dark' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
              `}
            >
              <span>{interest}</span>
              {selectedInterests.includes(interest) && (
                <CheckCircle2 className="h-4 w-4 ml-1" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      <div className="pt-4 flex flex-col gap-3">
        <Button 
          type="submit" 
          className="w-full rounded-md bg-merinno-dark hover:bg-black text-white"
          disabled={isLoading || isLoadingTags}
        >
          {isLoading ? "Salvando..." : "Atualizar Perfil"}
        </Button>
        
        <Button 
          type="button" 
          variant="ghost"
          className="flex items-center justify-center gap-2 text-gray-500 mt-2"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    </form>
  );
};

export default InterestsStep;
