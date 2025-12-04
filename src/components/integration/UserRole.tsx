
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, FileText, Target, Award, CheckCircle, Briefcase } from "lucide-react";
import { UserProfile } from "@/types/user";
import { UserRoleProfile } from "./UserRoleProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

interface UserRoleProps {
  role: {
    title: string;
    description: string | null;
    responsibilities: string | null;
    requirements: string | null;
    expectations: string | null;
  };
  companyColor: string;
  userProfile?: UserProfile | null;
}

export const UserRole: React.FC<UserRoleProps> = ({ role, companyColor, userProfile }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Verificar se há um role válido
  const hasValidRole = role && role.title && role.title.trim() !== '';
  
  // Function to get user's initials for avatar fallback
  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Listen for company data updates to refresh content
  useEffect(() => {
    const handleCompanyDataUpdate = () => {
      console.log('[UserRole] Company data updated, refreshing component');
      setRefreshKey(prev => prev + 1);
    };

    // Listen for various company update events
    window.addEventListener('company-data-updated', handleCompanyDataUpdate);
    window.addEventListener('integration-data-updated', handleCompanyDataUpdate);
    window.addEventListener('company-updated', handleCompanyDataUpdate);
    window.addEventListener('force-company-refresh', handleCompanyDataUpdate);
    
    return () => {
      window.removeEventListener('company-data-updated', handleCompanyDataUpdate);
      window.removeEventListener('integration-data-updated', handleCompanyDataUpdate);
      window.removeEventListener('company-updated', handleCompanyDataUpdate);
      window.removeEventListener('force-company-refresh', handleCompanyDataUpdate);
    };
  }, []);
  
  // Store the company logo in localStorage when the component mounts
  React.useEffect(() => {
    const companyLogo = localStorage.getItem('selectedCompanyLogo');
    if (!companyLogo) {
      // If no logo is stored, try to get it from another source or use a default
      const logoUrl = localStorage.getItem('selectedCompanyLogo') || "/placeholder.svg";
      localStorage.setItem('selectedCompanyLogo', logoUrl);
    }
  }, [refreshKey]); // Add refreshKey as dependency
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, [refreshKey]);

  // Se não há role válido, mostrar EmptyState
  if (!hasValidRole) {
    return (
      <div className="flex justify-center py-12">
        <EmptyState
          title="Nenhum cargo atribuído"
          description="Nenhum cargo atribuído para você nesta empresa"
          icons={[Briefcase]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8" key={refreshKey}>
      {/* Introduction Card */}
      <Card className={`transition-all duration-700 ease-out border border-gray-100 dark:border-gray-800 rounded-[30px] bg-white dark:bg-[#222222] hover:bg-gray-50 dark:hover:bg-[#2C2C2C] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <CardContent className="p-8 md:p-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Descrição do Cargo</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Entendemos que uma descrição de cargo clara e bem estruturada é mais do que uma lista de tarefas e requisitos — é a ponte entre
            talentos excepcionais e papéis transformadores. Cada descrição de cargo foi cuidadosamente elaborada para refletir não apenas as
            habilidades e experiências necessárias, mas também para dar uma visão genuína sobre como é trabalhar em nosso ecossistema.
          </p>
        </CardContent>
      </Card>

      {/* User Role Profile */}
      {userProfile && (
        <UserRoleProfile 
          userProfile={userProfile} 
          roleTitle={role.title} 
          companyColor={companyColor}
        />
      )}
      
      {/* Modern Role Description Card */}
      <Card className={`transition-all duration-700 ease-out border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#222222] rounded-[30px] hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-gray-900/30 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: '100ms' }}>
        <CardHeader className="pb-8 p-8">
          <div className="flex items-center gap-6">
            <div 
              className="w-16 h-16 rounded-3xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
              style={{ 
                background: `linear-gradient(135deg, ${companyColor}20 0%, ${companyColor}10 100%)`,
                border: `1px solid ${companyColor}30` 
              }}
            >
              <Briefcase style={{ color: companyColor }} className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {role.title}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Informações detalhadas sobre a posição
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-0 px-8 pb-8">
          {/* Description Section */}
          {role.description && (
            <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
              <div className="flex items-start gap-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <FileText style={{ color: companyColor }} className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sobre a Posição</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Responsibilities Section */}
          {role.responsibilities && (
            <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
              <div className="flex items-start gap-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <CheckCircle style={{ color: companyColor }} className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Responsabilidades</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {role.responsibilities}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Requirements Section */}
          {role.requirements && (
            <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
              <div className="flex items-start gap-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <Award style={{ color: companyColor }} className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requisitos</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {role.requirements}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expectations Section */}
          {role.expectations && (
            <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
              <div className="flex items-start gap-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <Target style={{ color: companyColor }} className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expectativas</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {role.expectations}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
