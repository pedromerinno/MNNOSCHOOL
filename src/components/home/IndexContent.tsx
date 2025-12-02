
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { UserHome } from "@/components/home/UserHome";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { Preloader } from "@/components/ui/Preloader";

export const IndexContent = () => {
  const { user, userProfile, loading: authLoading, profileLoading } = useAuth();
  const { selectedCompany, isLoading } = useCompanies();
  const [profileLoadTimeout, setProfileLoadTimeout] = useState(false);

  // Timeout de segurança: se após 3 segundos o perfil não carregou, permitir mostrar conteúdo
  useEffect(() => {
    if (user && !userProfile && profileLoading) {
      const timer = setTimeout(() => {
        console.log("[IndexContent] Profile load timeout after 3s - allowing content to show");
        setProfileLoadTimeout(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else if (userProfile) {
      // Reset timeout se perfil foi carregado
      setProfileLoadTimeout(false);
    }
  }, [user, userProfile, profileLoading]);

  // Calcular se deve mostrar preloader diretamente (memoizado para evitar recálculos)
  // Simplificado: só mostrar preloader se auth está carregando ou não tem usuário
  // Perfil pode carregar em background, mas com timeout de segurança
  const shouldShowPreloader = useMemo(() => {
    // Não mostrar preloader se:
    // - Tem usuário E
    // - Auth não está carregando E
    // - (Perfil não está carregando OU timeout ocorreu)
    // Isso permite mostrar conteúdo mesmo se perfil falhar ao carregar
    
    if (!user) return true; // Sem usuário = mostrar preloader
    if (authLoading) return true; // Auth carregando = mostrar preloader
    
    // Se perfil está carregando, só mostrar preloader se timeout não ocorreu
    if (profileLoading && !profileLoadTimeout) {
      return true;
    }
    
    // Caso contrário, mostrar conteúdo (mesmo sem perfil, se necessário)
    return false;
  }, [user, authLoading, profileLoading, userProfile, profileLoadTimeout]);

  // Debug log para verificar o estado (com throttling para evitar spam)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("[IndexContent] Debug state:", {
        user: user?.email,
        userProfile: userProfile?.display_name,
        isSuperAdmin: userProfile?.super_admin,
        selectedCompany: selectedCompany?.nome,
        isLoading,
        authLoading,
        profileLoading,
        shouldShowPreloader
      });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [user?.email, userProfile?.display_name, selectedCompany?.nome, isLoading, authLoading, profileLoading, shouldShowPreloader]);

  // Se deve mostrar preloader, mostrar
  if (shouldShowPreloader) {
    return <Preloader autoHide={false} />;
  }

  // Se tem usuário e (perfil ou timeout), sempre mostrar a home com header
  console.log("[IndexContent] User authenticated - showing UserHome with header");
  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-background pt-16 lg:pt-0">
        <UserHome />
      </div>
    </>
  );
};
