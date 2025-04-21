
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CompanyInfoDisplay } from "@/components/company/CompanyInfoDisplay";
import { Skeleton } from "@/components/ui/skeleton";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const userName = userProfile?.display_name || user?.email?.split('@')[0] || 'User';

  const handleLearnMore = () => {
    navigate('/integration');
  };

  const defaultPhrase = "Together, we're designing the future of great companies";

  // Renderização condicional da frase institucional com fallback
  const renderCompanyInfo = (company: any) => (
    <p 
      className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5"
    >
      {company?.frase_institucional || defaultPhrase}
    </p>
  );

  // Fallback para estado de carregamento
  const loadingFallback = (
    <Skeleton className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] h-[80px] mx-auto leading-[1.1] mb-5" />
  );

  // Fallback para estado sem empresa
  const emptyFallback = (
    <p className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5 mx-auto">
      {defaultPhrase}
    </p>
  );

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold"
        >
          Hello, {userName}
        </p>
        
        <CompanyInfoDisplay 
          renderInfo={renderCompanyInfo}
          loadingFallback={loadingFallback}
          emptyFallback={emptyFallback}
        />
        
        <Button 
          onClick={handleLearnMore} 
          className="mt-1 flex items-center gap-2 text-white rounded-full text-sm transition-colors duration-300 bg-black hover:bg-black/90"
          variant="default"
        >
          Learn more
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
