
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanies } from "@/hooks/useCompanies";
import { User, MapPin, Calendar, TrendingUp, FileText, Clock, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

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
    <Card 
      className="border-0 shadow-sm backdrop-blur-sm rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${companyColor}10 0%, ${companyColor}05 100%)`,
        borderColor: `${companyColor}20`
      }}
    >
      <CardContent className="p-8">
        <div className="flex flex-col">
          {/* Header with user name, role and photos */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex flex-col mb-4 md:mb-0">
              <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                {userProfile.display_name || "Usuário"}
              </h1>
            </div>
            
            <div className="relative flex items-center">
              {/* Company logo positioned behind the avatar */}
              <div className="h-16 w-16 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm">
                <img 
                  src={selectedCompany?.logo || "/placeholder.svg"} 
                  alt="Company Logo" 
                  className="w-full h-full object-cover rounded-full" 
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }} 
                />
              </div>
              
              {/* User avatar positioned slightly in front and to the right */}
              <Avatar className="h-16 w-16 -ml-4 relative z-10 border-2 border-white">
                <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-base font-medium">
                  {getInitials(userProfile.display_name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* User information grid with border */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
              Informações do Colaborador
            </h2>

            <div 
              className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-2xl border-2"
              style={{
                borderColor: companyColor,
                backgroundColor: 'rgba(255, 255, 255, 0.4)'
              }}
            >
              {/* Nome */}
              <div className="flex flex-col items-center text-center p-3 bg-white/60 rounded-2xl border border-white/40">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                  <User size={16} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Nome</p>
                <p className="text-sm font-medium text-gray-900">
                  {userProfile.display_name || "Não informado"}
                </p>
              </div>

              {/* Cidade */}
              <div className="flex flex-col items-center text-center p-3 bg-white/60 rounded-2xl border border-white/40">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                  <MapPin size={16} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Cidade</p>
                <p className="text-sm font-medium text-gray-900">
                  {userProfile.cidade || "Não informado"}
                </p>
              </div>

              {/* Aniversário */}
              <div className="flex flex-col items-center text-center p-3 bg-white/60 rounded-2xl border border-white/40">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                  <Calendar size={16} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Aniversário</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatBirthday(userProfile.aniversario) || "Não informado"}
                </p>
              </div>

              {/* Nível */}
              <div className="flex flex-col items-center text-center p-3 bg-white/60 rounded-2xl border border-white/40">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                  <TrendingUp size={16} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Nível</p>
                <p className="text-sm font-medium text-gray-900">
                  {userProfile.nivel_colaborador || "Não informado"}
                </p>
              </div>

              {/* Tipo de Contrato */}
              <div className="flex flex-col items-center text-center p-3 bg-white/60 rounded-2xl border border-white/40">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                  <FileText size={16} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Tipo de Contrato</p>
                <p className="text-sm font-medium text-gray-900">
                  {userProfile.tipo_contrato || "Não informado"}
                </p>
              </div>

              {/* Data de Início */}
              <div className="flex flex-col items-center text-center p-3 bg-white/60 rounded-2xl border border-white/40">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                  <Clock size={16} className="text-gray-600" />
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Data de Início</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(userProfile.data_inicio) || "Não informado"}
                </p>
              </div>
            </div>
          </div>

          {/* Manual de cultura status */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
              Status do Manual de Cultura
            </h2>

            <div className="flex flex-col items-center text-center p-4 bg-white/60 rounded-2xl border border-white/40 max-w-sm mx-auto">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                {userProfile.manual_cultura_aceito ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : (
                  <AlertCircle size={18} className="text-amber-500" />
                )}
              </div>
              
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Manual de Cultura</p>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
