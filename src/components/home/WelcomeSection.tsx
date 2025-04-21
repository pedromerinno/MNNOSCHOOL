
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Company } from "@/types/company";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const navigate = useNavigate();
  const [displayCompany, setDisplayCompany] = useState<Company | null>(null);

  // Update display company when selection changes
  useEffect(() => {
    if (selectedCompany) {
      console.log('[WelcomeSection] Selected company updated:', selectedCompany.nome);
      setDisplayCompany(selectedCompany);
    }
  }, [selectedCompany]);

  // Listen for company update events
  useEffect(() => {
    const handleCompanyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedCompany = customEvent.detail?.company;
      
      if (updatedCompany) {
        console.log('[WelcomeSection] Company update event received:', updatedCompany.nome);
        setDisplayCompany(updatedCompany);
      }
    };
    
    window.addEventListener('company-updated', handleCompanyUpdate);
    window.addEventListener('company-selected', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate);
      window.removeEventListener('company-selected', handleCompanyUpdate);
    };
  }, []);

  const userName = userProfile?.display_name || user?.email?.split('@')[0] || 'User';

  const handleLearnMore = () => {
    navigate('/integration');
  };

  const defaultPhrase = "Together, we're designing the future of great companies";
  const companyPhrase = displayCompany?.frase_institucional || defaultPhrase;

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-amber-900/30 py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold"
        >
          Hello, {userName}
        </p>
        
        <p 
          className="text-[#000000] text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5"
        >
          {companyPhrase}
        </p>
        
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
