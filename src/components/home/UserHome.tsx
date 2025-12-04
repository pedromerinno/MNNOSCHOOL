
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { WelcomeSection } from "./WelcomeSection";
import { QuickLinks } from "./QuickLinks";
import { DashboardWidgets } from "./DashboardWidgets";
import { Footer } from "./Footer";
import { AdminFloatingActionButton } from "../admin/AdminFloatingActionButton";
import { CompanySelectionDialog } from "./CompanySelectionDialog";
import { NewFeaturesDialog } from "./NewFeaturesDialog";
import { useEffect, useState, useRef } from "react";

export const UserHome = () => {
  const { user, userProfile } = useAuth();
  const { userCompanies, isLoading, fetchCount, forceGetUserCompanies } = useCompanies();
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showNewFeaturesDialog, setShowNewFeaturesDialog] = useState(false);
  const hasVerifiedCompanies = useRef(false);
  const hasAttemptedForceCheck = useRef(false);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar se deve mostrar o diálogo de empresa após carregamento completo
  useEffect(() => {
    // Limpar timeout anterior se existir
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
      verificationTimeoutRef.current = null;
    }

    // Não fazer nada se não tiver usuário ou perfil
    if (!user || !userProfile) {
      console.log("[UserHome] Sem usuário ou perfil, aguardando...");
      return;
    }

    // Não mostrar dialog para super admin
    if (userProfile.super_admin) {
      console.log("[UserHome] Usuário é super admin, não mostrar dialog");
      setShowCompanyDialog(false);
      return;
    }

    // Se já tem empresas, não mostrar dialog
    if (userCompanies.length > 0) {
      console.log("[UserHome] Usuário já tem empresas, não mostrar dialog", {
        companiesCount: userCompanies.length
      });
      setShowCompanyDialog(false);
      hasVerifiedCompanies.current = true;
      return;
    }

    // Se já fez a verificação forçada e confirmou que não tem empresas, mostrar dialog
    if (hasVerifiedCompanies.current && userCompanies.length === 0) {
      console.log("[UserHome] Já verificou e confirmou: sem empresas. Mostrando dialog.");
      setShowCompanyDialog(true);
      return;
    }

    // Se ainda está carregando, aguardar (mas com timeout de segurança)
    if (isLoading) {
      console.log("[UserHome] Ainda carregando empresas, aguardando...");
      
      // Timeout de segurança: se após 3 segundos ainda estiver carregando, fazer verificação forçada
      if (!hasAttemptedForceCheck.current) {
        verificationTimeoutRef.current = setTimeout(() => {
          console.log("[UserHome] Timeout: ainda carregando após 3s, forçando verificação...");
          if (user?.id && !hasAttemptedForceCheck.current) {
            hasAttemptedForceCheck.current = true;
            forceGetUserCompanies(user.id).then(companies => {
              hasVerifiedCompanies.current = true;
              console.log("[UserHome] Verificação forçada (timeout) concluída", {
                companiesCount: companies.length
              });
              setShowCompanyDialog(companies.length === 0);
            }).catch(err => {
              console.error("[UserHome] Erro na verificação forçada (timeout):", err);
              hasVerifiedCompanies.current = true;
              setShowCompanyDialog(true);
            });
          }
        }, 3000);
      }
      return;
    }

    // Fazer verificação forçada uma vez para garantir que não há empresas
    if (!hasAttemptedForceCheck.current) {
      hasAttemptedForceCheck.current = true;
      console.log("[UserHome] Fazendo verificação forçada de empresas...", {
        fetchCount,
        isLoading,
        userCompaniesLength: userCompanies.length
      });
      
      // Usar uma variável local para garantir que o estado seja atualizado corretamente
      forceGetUserCompanies(user.id).then(companies => {
        console.log("[UserHome] Verificação forçada concluída (promise)", {
          companiesCount: companies.length,
          companies: companies.map(c => c.nome),
          userCompaniesLength: userCompanies.length
        });
        
        // Aguardar um pequeno delay para garantir que userCompanies foi atualizado
        setTimeout(() => {
          hasVerifiedCompanies.current = true;
          
          // Verificar novamente o estado atual de userCompanies após a atualização
          // Se ainda não houver empresas, mostrar dialog
          if (companies.length === 0) {
            console.log("[UserHome] ✅ Confirmado: usuário não tem empresas. Mostrando dialog...");
            setShowCompanyDialog(true);
          } else {
            console.log("[UserHome] Empresas encontradas após verificação forçada. Não mostrar dialog.");
            setShowCompanyDialog(false);
          }
        }, 100);
      }).catch(err => {
        console.error("[UserHome] Erro ao verificar empresas forçadamente:", err);
        hasVerifiedCompanies.current = true;
        // Em caso de erro, mostrar dialog se não houver empresas no estado atual
        // (pode ser que o usuário realmente não tenha empresas)
        if (userCompanies.length === 0) {
          console.log("[UserHome] Erro na verificação, mas sem empresas no estado. Mostrando dialog por segurança.");
          setShowCompanyDialog(true);
        } else {
          setShowCompanyDialog(false);
        }
      });
    }
  }, [user, userProfile, userCompanies, isLoading, fetchCount, forceGetUserCompanies]);

  // Cleanup timeout ao desmontar
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // Resetar flags quando o usuário mudar
  useEffect(() => {
    hasVerifiedCompanies.current = false;
    hasAttemptedForceCheck.current = false;
    setShowCompanyDialog(false);
  }, [user?.id]);

  // Log do estado do dialog para debug
  useEffect(() => {
    console.log("[UserHome] Estado do dialog atualizado", {
      showCompanyDialog,
      userCompaniesLength: userCompanies.length,
      isLoading,
      fetchCount,
      hasVerified: hasVerifiedCompanies.current,
      hasAttempted: hasAttemptedForceCheck.current
    });
  }, [showCompanyDialog, userCompanies.length, isLoading, fetchCount]);

  // Verificar se deve mostrar o dialog de novas features baseado em primeiro_login
  useEffect(() => {
    if (userProfile && userProfile.primeiro_login === true) {
      // Pequeno delay para melhor UX
      const timer = setTimeout(() => {
        setShowNewFeaturesDialog(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userProfile]);

  const handleCompanyCreated = () => {
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
    }
  };

  const handleCompanyTypeSelect = (isExisting: boolean) => {
    // Handler para seleção de tipo de empresa
  };
  
  // Verificar se o usuário tem empresas (considerando super admin)
  // Só considerar sem empresas se já verificou e confirmou que não tem
  const hasNoCompanies = !userProfile?.super_admin && 
                         hasVerifiedCompanies.current && 
                         userCompanies.length === 0 &&
                         !isLoading;

  return (
    <>
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
        <main className="container mx-auto px-4 py-8">
          <WelcomeSection hasNoCompanies={hasNoCompanies} />
          
          <QuickLinks hasNoCompanies={hasNoCompanies} />
          <DashboardWidgets />
        </main>
        <Footer />
        <AdminFloatingActionButton />
      </div>

      <CompanySelectionDialog
        open={showCompanyDialog}
        onOpenChange={(open) => {
          console.log("[UserHome] CompanySelectionDialog onOpenChange", {
            open,
            isSuperAdmin: userProfile?.super_admin,
            hasCompanies: userCompanies.length > 0
          });
          // Só permitir fechar se o usuário é super admin ou tem empresas
          if (!open && (userProfile?.super_admin || userCompanies.length > 0)) {
            setShowCompanyDialog(false);
          }
        }}
        onCompanyTypeSelect={handleCompanyTypeSelect}
        onCompanyCreated={handleCompanyCreated}
        userId={user?.id}
        forceGetUserCompanies={forceGetUserCompanies}
      />

      <NewFeaturesDialog 
        open={showNewFeaturesDialog}
        onOpenChange={setShowNewFeaturesDialog}
      />
    </>
  );
};
