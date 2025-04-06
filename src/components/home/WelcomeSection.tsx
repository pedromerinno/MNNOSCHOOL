
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const WelcomeSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLearnMore = () => {
    navigate('/');
  };

  // Extract the name from email if no specific name is available
  const userName = user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="mb-8">
      <p className="text-gray-600 mb-2">Olá, {userName}</p>
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
        Juntos, estamos desenhando<br />
        o futuro de grandes empresas
      </h1>
      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleLearnMore}
          className="bg-black hover:bg-black/90 text-white rounded-full px-6"
        >
          Clique para saber mais sobre a MNNO
        </Button>
      </div>
    </div>
  );
};
