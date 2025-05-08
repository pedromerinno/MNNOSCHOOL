
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseBusiness, User } from "lucide-react";
import { UserProfile } from "@/types/user";
import { UserRoleProfile } from "./UserRoleProfile";

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
  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <Card className="transition-all duration-200 shadow-sm bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
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
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <BriefcaseBusiness style={{ color: companyColor }} className="h-8 w-8" />
          <div>
            <CardTitle className="text-lg">SOBRE O CARGO</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
            <h3 className="font-medium mb-3 text-lg">{role.title}</h3>
            {role.description && (
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {role.description}
              </p>
            )}
          </div>

          {role.responsibilities && (
            <div>
              <h4 className="font-medium mb-2 text-md">Responsabilidades</h4>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                {role.responsibilities}
              </p>
            </div>
          )}

          {role.requirements && (
            <div>
              <h4 className="font-medium mb-2 text-md">Requisitos</h4>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                {role.requirements}
              </p>
            </div>
          )}

          {role.expectations && (
            <div>
              <h4 className="font-medium mb-2 text-md">Expectativas</h4>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                {role.expectations}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
