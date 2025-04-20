
import React, { useState, useEffect } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileStepProps {
  onNext: () => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ onNext }) => {
  const { profileData, updateProfileData } = useOnboarding();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(profileData.displayName);
  const [error, setError] = useState("");

  useEffect(() => {
    // Se não tiver nome, usar email como base
    if (!displayName && user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [user, displayName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError("Por favor, informe seu nome");
      return;
    }
    
    updateProfileData({ displayName });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Como podemos te chamar?</h2>
        <p className="text-gray-500 text-sm">
          Este será o nome exibido para outros usuários na plataforma.
        </p>
      </div>
      
      <div className="space-y-3">
        <label htmlFor="name" className="text-sm text-gray-500">
          Seu nome
        </label>
        <Input
          id="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="Digite seu nome"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full rounded-[100px] border-solid border-1 px-8 py-4 bg-merinno-dark hover:bg-black text-white"
        >
          Continuar
        </Button>
      </div>
    </form>
  );
};

export default ProfileStep;

