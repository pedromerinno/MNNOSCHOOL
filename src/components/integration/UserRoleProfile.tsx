
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanies } from "@/hooks/useCompanies";
import { MapPin, Calendar, Award, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', {
        locale: ptBR
      });
    } catch (error) {
      return "—";
    }
  };

  // Format birthday date (only day and month)
  const formatBirthday = (dateString?: string | null): string => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), 'dd/MM', {
        locale: ptBR
      });
    } catch (error) {
      return "—";
    }
  };
  
  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <CardContent className="p-0">
        {/* Header - Cartão do Colaborador */}
        <div 
          className="relative rounded-t-lg p-6"
          style={{
            background: `linear-gradient(135deg, ${companyColor} 0%, ${companyColor}90 100%)`
          }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="w-20 h-20 ring-4 ring-white/20">
              <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
              <AvatarFallback 
                className="text-white font-bold text-xl bg-white/20"
              >
                {getInitials(userProfile.display_name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Informações principais */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {userProfile.display_name || "Usuário"}
              </h2>
              <p className="text-lg text-white/90 font-medium mb-2">
                {roleTitle}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/80" />
                <span className="text-sm text-white/80 font-medium">
                  {selectedCompany?.nome}
                </span>
              </div>
            </div>
            
            {/* Logo da empresa */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm">
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

        {/* Informações detalhadas */}
        <div className="p-6 space-y-6">
          {/* Grid de informações pessoais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cidade</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userProfile.cidade || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aniversário</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatBirthday(userProfile.aniversario)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Award className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nível</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userProfile.nivel_colaborador || "Não definido"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Data de Início</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(userProfile.data_inicio)}
                </p>
              </div>
            </div>
          </div>

          {/* Informações de contato */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Informações de Contato
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">E-mail</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userProfile.email}
                </span>
              </div>
              
              {userProfile.telefone && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Telefone</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {userProfile.telefone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status de integração */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Status de Integração
            </h3>
            
            <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {userProfile.manual_cultura_aceito ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Manual de Cultura
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userProfile.manual_cultura_aceito 
                      ? 'Lido e aceito pelo colaborador' 
                      : 'Aguardando leitura e aceite'
                    }
                  </p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                userProfile.manual_cultura_aceito 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {userProfile.manual_cultura_aceito ? 'Concluído' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
