
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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

interface InterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
}

export const InterestsSelector: React.FC<InterestsSelectorProps> = ({ 
  selectedInterests, 
  onInterestsChange 
}) => {
  const handleInterestToggle = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    onInterestsChange(newInterests);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-500">
        Seus interesses
      </label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_INTERESTS.map(interest => (
          <button
            key={interest}
            type="button"
            onClick={() => handleInterestToggle(interest)}
            className={`
              px-3 py-1 rounded-full text-sm
              ${selectedInterests.includes(interest) 
                ? 'bg-merinno-dark text-white' 
                : 'bg-gray-200 text-gray-700'}
            `}
          >
            {interest}
          </button>
        ))}
      </div>
    </div>
  );
};
