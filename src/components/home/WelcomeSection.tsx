
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const WelcomeSection = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const handleLearnMore = () => {
    navigate('/');
  };

  // Use displayName from userProfile if available, otherwise extract from email
  const userName = userProfile.displayName || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="mb-16 mt-16">
      <div className="flex justify-center">
        <p 
          className="text-gray-600 mb-2 text-center bg-[#FFF1E0] py-2.5 px-4 rounded-full max-w-fit"
        >
          Olá, {userName}
        </p>
      </div>
      <h1 className="text-3xl md:text-4xl font-medium text-center my-5">
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

