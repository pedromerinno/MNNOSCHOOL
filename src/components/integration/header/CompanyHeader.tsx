
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Company } from "@/types/company";
import { Building2, Users, BookOpen } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { MemberCard } from '@/components/integration/MemberCard';
import { useAuth } from "@/contexts/AuthContext";
import { JobRole } from "@/types/job-roles";
import { cn } from "@/lib/utils";

interface CompanyHeaderProps {
  company: Company | null;
  companyColor: string;
  userRole?: JobRole | null;
}

// Função para converter cor para rgba com opacidade
const colorToRgba = (color: string, opacity: number): string => {
  // Se já for rgba, extrair os valores RGB
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
  }
  
  // Se for hex
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (hexMatch) {
    const r = parseInt(hexMatch[1], 16);
    const g = parseInt(hexMatch[2], 16);
    const b = parseInt(hexMatch[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Se for hex curto (3 dígitos)
  const hexShortMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(color);
  if (hexShortMatch) {
    const r = parseInt(hexShortMatch[1] + hexShortMatch[1], 16);
    const g = parseInt(hexShortMatch[2] + hexShortMatch[2], 16);
    const b = parseInt(hexShortMatch[3] + hexShortMatch[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Se não conseguir converter, retornar a cor original
  return color;
};

const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  companyColor 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType;
  companyColor: string;
}) => {
  // Criar cor suave para o borrão de fundo (bem mais claro)
  const backgroundBlurColor = companyColor 
    ? colorToRgba(companyColor, 0.05) // Bem mais claro
    : undefined;

  return (
    <motion.div 
      className={cn(
        "flex flex-col p-4 rounded-xl border border-[rgba(255,255,255,0.10)] dark:bg-[rgba(40,40,40,0.70)] shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] group relative",
        !backgroundBlurColor && "bg-gray-100 dark:bg-[rgba(40,40,40,0.70)]"
      )}
      style={{ 
        aspectRatio: '1.586 / 1',
        ...(backgroundBlurColor ? { backgroundColor: backgroundBlurColor } : {})
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Ícone no topo esquerdo */}
      <div className="absolute top-4 left-4">
        <motion.div
          className="rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)] shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)] h-10 w-10"
          style={{
            backgroundColor: colorToRgba(companyColor, 0.12),
          }}
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon 
            className="h-5 w-5" 
            style={{ color: companyColor }}
          />
        </motion.div>
      </div>
      
      {/* Conteúdo central - número e label */}
      <div className="flex flex-col items-center justify-center flex-1 h-full">
        {/* Número */}
        <motion.div 
          className="text-4xl lg:text-5xl font-bold text-center mb-1"
          style={{ 
            color: companyColor,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.div>
        
        {/* Label */}
        <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold text-center">
          {label}
        </div>
      </div>
    </motion.div>
  );
};

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ 
  company,
  companyColor,
  userRole
}) => {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({
    teamMembers: 0,
    courses: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!company?.id) {
        setStats({
          teamMembers: 0,
          courses: 0
        });
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Buscar todos os usuários da empresa usando a função RPC (mesma usada em outros lugares)
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_company_users', { _empresa_id: company.id });

        if (usersError) {
          console.error('Error fetching company users:', usersError);
        }

        // Contar usuários únicos (pode haver duplicatas em alguns casos)
        const teamCount = usersData ? new Set(usersData.map((u: any) => u.id)).size : 0;

        // Buscar cursos da empresa
        const { count: coursesCount } = await supabase
          .from('company_courses')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', company.id);

        setStats({
          teamMembers: teamCount,
          courses: coursesCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [company?.id]);

  // Sempre renderizar para manter hooks consistentes
  if (!company) {
    return (
      <div className="relative">
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500 dark:text-gray-400">Nenhuma empresa selecionada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-stretch">
        {/* Member Card */}
        {userProfile && company && (
          <motion.div 
            className="flex justify-center w-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="w-full">
              <MemberCard
                userName={userProfile.display_name || user?.email?.split('@')[0] || 'Usuário'}
                userAvatar={userProfile.avatar}
                companyName={company.nome}
                companyLogo={company.logo}
                companyColor={companyColor}
                roleTitle={userRole?.title || undefined}
              />
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard
            label="Colaboradores"
            value={isLoading ? '...' : stats.teamMembers}
            icon={Users}
            companyColor={companyColor}
          />
        </motion.div>

        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatCard
            label="Cursos"
            value={isLoading ? '...' : stats.courses}
            icon={BookOpen}
            companyColor={companyColor}
          />
        </motion.div>
      </div>
    </div>
  );
};
