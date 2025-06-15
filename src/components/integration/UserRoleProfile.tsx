
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanies } from "@/hooks/useCompanies";
import { X } from "lucide-react";

interface UserRoleProfileProps {
  userProfile: UserProfile;
  roleTitle: string;
  companyColor: string;
}

export const UserRoleProfile: React.FC<UserRoleProfileProps> = ({
  userProfile,
  roleTitle,
  companyColor
}) => {
  const { selectedCompany } = useCompanies();

  // Function to get user's initials for avatar fallback
  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    return name.split(" ").map(part => part[0]).join("").toUpperCase().substring(0, 2);
  };

  // Format date if it exists
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "Não informado";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', {
        locale: ptBR
      });
    } catch (error) {
      return "Não informado";
    }
  };

  // Format birthday date (only day and month)
  const formatBirthday = (dateString?: string | null): string => {
    if (!dateString) return "Não informado";
    try {
      return format(new Date(dateString), 'dd/MM', {
        locale: ptBR
      });
    } catch (error) {
      return "Não informado";
    }
  };
  
  return (
    <Card className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <CardContent className="p-0">
        {/* Header Section */}
        <div 
          className="relative p-6 rounded-t-lg"
          style={{
            background: `linear-gradient(135deg, ${companyColor}15 0%, ${companyColor}05 100%)`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-white shadow-md">
                <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                <AvatarFallback 
                  className="text-white font-semibold text-lg"
                  style={{ backgroundColor: companyColor }}
                >
                  {getInitials(userProfile.display_name)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ color: companyColor }}>
                  {userProfile.display_name?.toUpperCase() || "USUÁRIO"}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {roleTitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedCompany?.logo || "/placeholder.svg"} alt="Company Logo" />
                <AvatarFallback>
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                </AvatarFallback>
              </Avatar>
              
              <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: companyColor }}>
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="p-6">
          <div 
            className="text-center py-3 mb-6 rounded-lg font-semibold text-white"
            style={{ backgroundColor: companyColor }}
          >
            INFORMAÇÕES DO COLABORADOR
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Nome</label>
              <p className="font-medium text-lg" style={{ color: companyColor }}>
                {userProfile.display_name || "Não informado"}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Cidade</label>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {userProfile.cidade || "Não informado"}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Aniversário</label>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatBirthday(userProfile.aniversario)}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Nível</label>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {userProfile.nivel_colaborador || "Não informado"}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Tipo de Contrato</label>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Não informado
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Data de Início</label>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(userProfile.data_inicio)}
              </p>
            </div>
          </div>
        </div>

        {/* Culture Manual Status Section */}
        <div className="px-6 pb-6">
          <div 
            className="text-center py-3 mb-4 rounded-lg font-semibold text-white"
            style={{ backgroundColor: companyColor }}
          >
            STATUS DO MANUAL DE CULTURA
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Manual de Cultura
            </span>
            <span 
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                userProfile.manual_cultura_aceito 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
            >
              {userProfile.manual_cultura_aceito ? 'Aceito' : 'Pendente'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
