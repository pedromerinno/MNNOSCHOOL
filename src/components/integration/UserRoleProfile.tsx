
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
  
  return (
    <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col">
          {/* Header with user name and role */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="flex flex-col mb-6 md:mb-0">
              <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-2">
                {userProfile.display_name || "Usuário"}
              </h1>
              <p className="text-lg font-medium text-gray-500">{roleTitle}</p>
            </div>
            
            <div className="flex items-center relative">
              <Avatar className="h-20 w-20 z-10 ring-4 ring-white shadow-lg">
                <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-medium">
                  {getInitials(userProfile.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-lg ml-[-8px] ring-1 ring-gray-100">
                <img 
                  src={selectedCompany?.logo || "/placeholder.svg"} 
                  alt="Company Logo" 
                  className="w-10 h-10 object-contain" 
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }} 
                />
              </div>
            </div>
          </div>

          {/* User information section */}
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8 text-center">
              Informações do Colaborador
            </h2>

            {/* Grid layout for user information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nome */}
              <div className="flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl border border-gray-100/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <User size={20} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Nome</p>
                <p className="text-base font-medium text-gray-900">
                  {userProfile.display_name || "Não informado"}
                </p>
              </div>

              {/* Cidade */}
              <div className="flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl border border-gray-100/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <MapPin size={20} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Cidade</p>
                <p className="text-base font-medium text-gray-900">
                  {userProfile.cidade || "Não informado"}
                </p>
              </div>

              {/* Aniversário */}
              <div className="flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl border border-gray-100/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <Calendar size={20} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Aniversário</p>
                <p className="text-base font-medium text-gray-900">
                  {formatBirthday(userProfile.aniversario) || "Não informado"}
                </p>
              </div>

              {/* Nível */}
              <div className="flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl border border-gray-100/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <TrendingUp size={20} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Nível</p>
                <p className="text-base font-medium text-gray-900">
                  {userProfile.nivel_colaborador || "Não informado"}
                </p>
              </div>

              {/* Tipo de Contrato */}
              <div className="flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl border border-gray-100/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <FileText size={20} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Tipo de Contrato</p>
                <p className="text-base font-medium text-gray-900">
                  {userProfile.tipo_contrato || "Não informado"}
                </p>
              </div>

              {/* Data de Início */}
              <div className="flex flex-col items-center text-center p-6 bg-white/80 rounded-2xl border border-gray-100/50">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <Clock size={20} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Data de Início</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(userProfile.data_inicio) || "Não informado"}
                </p>
              </div>
            </div>
          </div>

          {/* Manual de cultura status */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8 text-center">
              Status do Manual de Cultura
            </h2>

            <div className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl border border-gray-100/50 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                {userProfile.manual_cultura_aceito ? (
                  <CheckCircle2 size={24} className="text-green-500" />
                ) : (
                  <AlertCircle size={24} className="text-amber-500" />
                )}
              </div>
              
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Manual de Cultura</p>
              
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                userProfile.manual_cultura_aceito 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {userProfile.manual_cultura_aceito ? 'Aceito' : 'Pendente'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
