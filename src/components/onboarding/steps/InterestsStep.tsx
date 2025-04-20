
import React, { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface InterestsStepProps {
  onBack: () => void;
}

const AVAILABLE_INTERESTS = [
  'Tecnologia', 
  'Marketing', 
  'Gestão', 
  'Desenvolvimento Pessoal', 
  'Design', 
  'Negócios', 
  'Vendas', 
  'Inovação', 
  'Liderança', 
  'Saúde e Bem-estar'
];

const InterestsStep: React.FC<InterestsStepProps> = ({ onBack }) => {
  const { profileData, updateProfileData, saveProfileData, isLoading } = useOnboarding();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profileData.interests || []);
  const [error, setError] = useState("");

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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {AVAILABLE_INTERESTS.map(interest => (
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
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="pt-4 flex flex-col gap-3">
        <Button 
          type="submit" 
          className="w-full rounded-md bg-merinno-dark hover:bg-black text-white"
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : "Concluir"}
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
