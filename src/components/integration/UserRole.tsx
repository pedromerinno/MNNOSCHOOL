
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, FileText, Target, Award, CheckCircle, Briefcase } from "lucide-react";
import { UserProfile } from "@/types/user";
import { UserRoleProfile } from "./UserRoleProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  
  return (
    <div className="space-y-8" key={refreshKey}>
      {/* Introduction Card */}
      <Card className="transition-all duration-200 shadow-sm bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
            {userProfile && (
              <Avatar className="w-10 h-10">
                <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || ""} />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {getInitials(userProfile.display_name)}
                </AvatarFallback>
              </Avatar>
            )}
            <h2 className="text-xl font-semibold">Descrição do Cargo</h2>
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
      <Card className="transition-all duration-300 shadow-lg border-0 bg-gradient-to-br from-white via-gray-50/80 to-gray-100/60 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-700/60">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
              style={{ 
                background: `linear-gradient(135deg, ${companyColor}20 0%, ${companyColor}10 100%)`,
                border: `1px solid ${companyColor}30` 
              }}
            >
              <Briefcase style={{ color: companyColor }} className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {role.title}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Informações detalhadas sobre a posição
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-0">
          {/* Description Section */}
          {role.description && (
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <FileText style={{ color: companyColor }} className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sobre a Posição</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Responsibilities Section */}
          {role.responsibilities && (
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <CheckCircle style={{ color: companyColor }} className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Responsabilidades</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {role.responsibilities}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Requirements Section */}
          {role.requirements && (
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <Award style={{ color: companyColor }} className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requisitos</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {role.requirements}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expectations Section */}
          {role.expectations && (
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ backgroundColor: `${companyColor}15` }}
                >
                  <Target style={{ color: companyColor }} className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Expectativas</h3>
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
