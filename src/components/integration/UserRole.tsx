
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User } from "lucide-react";
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
      
      {/* Role Description Card */}
      <Card className="transition-all duration-200 shadow-sm border-gray-100 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${companyColor}15`, border: `1px solid ${companyColor}30` }}
          >
            <Building2 style={{ color: companyColor }} className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              SOBRE O CARGO
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Detalhes e responsabilidades da posição
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-lg text-gray-900 dark:text-white">{role.title}</h3>
            {role.description && (
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {role.description}
              </p>
            )}
          </div>

          {role.responsibilities && (
            <div>
              <h4 className="font-semibold mb-3 text-lg text-gray-900 dark:text-white">Responsabilidades</h4>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                {role.responsibilities}
              </p>
            </div>
          )}

          {role.requirements && (
            <div>
              <h4 className="font-semibold mb-3 text-lg text-gray-900 dark:text-white">Requisitos</h4>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                {role.requirements}
              </p>
            </div>
          )}

          {role.expectations && (
            <div>
              <h4 className="font-semibold mb-3 text-lg text-gray-900 dark:text-white">Expectativas</h4>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                {role.expectations}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
