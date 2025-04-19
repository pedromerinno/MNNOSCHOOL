
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseBusiness } from "lucide-react";

interface UserRoleProps {
  role: {
    title: string;
    description: string | null;
    responsibilities: string | null;
    requirements: string | null;
    expectations: string | null;
  };
  companyColor: string;
}

export const UserRole: React.FC<UserRoleProps> = ({ role, companyColor }) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <BriefcaseBusiness style={{ color: companyColor }} className="h-8 w-8" />
        <div>
          <CardTitle className="text-lg">{role.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {role.description && (
          <div>
            <h4 className="font-medium mb-2">Descrição do Cargo</h4>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {role.description}
            </p>
          </div>
        )}

        {role.responsibilities && (
          <div>
            <h4 className="font-medium mb-2">Responsabilidades</h4>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {role.responsibilities}
            </p>
          </div>
        )}

        {role.requirements && (
          <div>
            <h4 className="font-medium mb-2">Requisitos</h4>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {role.requirements}
            </p>
          </div>
        )}

        {role.expectations && (
          <div>
            <h4 className="font-medium mb-2">Expectativas</h4>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {role.expectations}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
