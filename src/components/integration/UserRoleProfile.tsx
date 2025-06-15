
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanies } from "@/hooks/useCompanies";
import { User, MapPin, Calendar, TrendingUp, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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
      return format(new Date(dateString), 'dd MMM, yyyy', {
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
      return format(new Date(dateString), 'dd \'de\' MMMM', {
        locale: ptBR
      });
    } catch (error) {
      return "";
    }
  };
  
  // Calculate lighter color for background
  const getLighterColor = (color: string, opacity: number = 0.1): string => {
    // If color is a hex code
    if (color.startsWith('#')) {
      return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    }
    // If color is an RGB value
    return `${color.split(')')[0]}, ${opacity})`;
  };
  
  return (
    <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm rounded-2xl" 
         style={{ 
           backgroundColor: getLighterColor(companyColor, 0.05),
           borderColor: getLighterColor(companyColor, 0.2)
         }}>
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col">
          {/* Header with user name and role */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex flex-col mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-blue-600" style={{
                color: companyColor
              }}>
                {userProfile.display_name?.toUpperCase() || "USUÁRIO"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{roleTitle}</p>
            </div>
            <div className="flex items-center relative">
              <Avatar className="h-16 w-16 z-10">
                <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {getInitials(userProfile.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-lg ml-[-12px]" style={{
                border: `3px solid ${companyColor}`
              }}>
                <img 
                  src={selectedCompany?.logo || "/placeholder.svg"} 
                  alt="Company Logo" 
                  className="w-full h-full object-cover" 
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Information sections */}
          <div className="space-y-8">
            {/* User information section */}
            <div>
              <div className="rounded-xl py-3 px-4 mb-6" style={{ 
                backgroundColor: getLighterColor(companyColor, 0.15),
              }}>
                <h3 style={{
                  color: companyColor
                }} className="text-sm font-semibold text-center">
                  INFORMAÇÕES DO COLABORADOR
                </h3>
              </div>

              <div className="space-y-4">
                {/* Nome */}
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: getLighterColor(companyColor, 0.2) }}>
                    <User size={18} style={{ color: companyColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Nome</p>
                    <p className="text-lg font-semibold" style={{ color: companyColor }}>
                      {userProfile.display_name || "Não informado"}
                    </p>
                  </div>
                </div>

                {/* Cidade */}
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: getLighterColor(companyColor, 0.2) }}>
                    <MapPin size={18} style={{ color: companyColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Cidade</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {userProfile.cidade || "Não informado"}
                    </p>
                  </div>
                </div>

                {/* Aniversário */}
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: getLighterColor(companyColor, 0.2) }}>
                    <Calendar size={18} style={{ color: companyColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Aniversário</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {formatBirthday(userProfile.aniversario) || "Não informado"}
                    </p>
                  </div>
                </div>

                {/* Nível */}
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: getLighterColor(companyColor, 0.2) }}>
                    <TrendingUp size={18} style={{ color: companyColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Nível</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {userProfile.nivel_colaborador || "Não informado"}
                    </p>
                  </div>
                </div>

                {/* Tipo de Contrato */}
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: getLighterColor(companyColor, 0.2) }}>
                    <FileText size={18} style={{ color: companyColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Tipo de Contrato</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {userProfile.tipo_contrato || "Não informado"}
                    </p>
                  </div>
                </div>

                {/* Data de Início */}
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: getLighterColor(companyColor, 0.2) }}>
                    <Clock size={18} style={{ color: companyColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Data de Início</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {formatDate(userProfile.data_inicio) || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual de cultura status */}
            <div>
              <div className="rounded-xl py-3 px-4 mb-6" style={{ 
                backgroundColor: getLighterColor(companyColor, 0.15),
              }}>
                <h3 style={{
                  color: companyColor
                }} className="text-sm font-semibold text-center">
                  STATUS DO MANUAL DE CULTURA
                </h3>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: getLighterColor(companyColor, 0.2) }}>
                  {userProfile.manual_cultura_aceito ? (
                    <CheckCircle2 size={18} className="text-green-600" />
                  ) : (
                    <AlertCircle size={18} className="text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Manual de Cultura</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    userProfile.manual_cultura_aceito 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {userProfile.manual_cultura_aceito ? 'Aceito' : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
