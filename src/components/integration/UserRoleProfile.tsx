
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanies } from "@/hooks/useCompanies";
import { CalendarDays, MapPin, Briefcase, Clock, CheckCircle, User } from "lucide-react";

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
    if (!dateString) return "";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', {
        locale: ptBR
      });
    } catch (error) {
      return "";
    }
  };

  // Format birthday date (only day and month)
  const formatBirthday = (dateString?: string | null): string => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), 'dd/MM', {
        locale: ptBR
      });
    } catch (error) {
      return "";
    }
  };
  
  return (
    <Card className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <CardContent className="p-0">
        {/* Header with company color */}
        <div 
          className="h-20 relative"
          style={{ backgroundColor: `${companyColor}15` }}
        >
          <div className="absolute -bottom-8 left-6 flex items-end gap-4">
            <Avatar className="w-16 h-16 border-4 border-white shadow-sm">
              <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
              <AvatarFallback 
                className="text-white font-bold text-lg"
                style={{ backgroundColor: companyColor }}
              >
                {getInitials(userProfile.display_name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Company logo */}
            <div className="mb-2">
              <img 
                src={selectedCompany?.logo || "/placeholder.svg"} 
                alt="Company Logo" 
                className="w-10 h-10 object-cover rounded-lg shadow-sm border border-gray-200" 
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }} 
              />
            </div>
          </div>
        </div>

        {/* User info and details */}
        <div className="pt-12 pb-6 px-6">
          {/* Name and role */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {userProfile.display_name || "Usuário"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {roleTitle}
            </p>
          </div>

          {/* Info grid - 2 columns */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Aniversário</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatBirthday(userProfile.aniversario) || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Cidade</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userProfile.cidade || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Nível</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userProfile.nivel_colaborador || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Contrato</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userProfile.tipo_contrato || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Início</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(userProfile.data_inicio) || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${
                userProfile.manual_cultura_aceito ? 'text-green-500' : 'text-yellow-500'
              }`} />
              <div>
                <p className="text-xs text-gray-500">Manual</p>
                <p className={`text-sm font-medium ${
                  userProfile.manual_cultura_aceito 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {userProfile.manual_cultura_aceito ? 'Aceito' : 'Pendente'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
