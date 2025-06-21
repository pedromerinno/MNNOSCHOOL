
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { VideoPlayer } from './video-playlist/VideoPlayer';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CultureManualProps {
  companyValues: any;
  companyMission: string;
  companyHistory: string;
  companyColor: string;
  companyLogo?: string;
  companyName?: string;
  videoUrl?: string;
  videoDescription?: string;
}

export const CultureManual: React.FC<CultureManualProps> = ({
  companyValues,
  companyMission,
  companyHistory,
  companyColor,
  companyLogo,
  companyName,
  videoUrl,
  videoDescription
}) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Verificar se o manual já foi aceito
  const isManualAccepted = userProfile?.manual_cultura_aceito || false;

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

  // Memoizar os valores para evitar re-processamento
  const values = useMemo(() => {
    if (!companyValues) return [];
    
    if (typeof companyValues === 'string') {
      try {
        const parsed = JSON.parse(companyValues);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [parsed];
      } catch (error) {
        console.error('Error parsing company values:', error);
        if (companyValues.trim()) {
          return [{
            title: 'Valor',
            description: companyValues
          }];
        }
        return [];
      }
    }

    if (Array.isArray(companyValues)) {
      return companyValues;
    }

    if (typeof companyValues === 'object' && companyValues !== null) {
      return [companyValues];
    }
    
    return [];
  }, [companyValues]);

  const handleAcceptManual = async () => {
    if (!userProfile?.id || isManualAccepted) {
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ manual_cultura_aceito: true })
        .eq('id', userProfile.id);

      if (error) {
        console.error('Erro ao atualizar manual de cultura:', error);
        toast.error('Erro ao aceitar o manual de cultura');
        return;
      }

      // Atualizar o perfil localmente
      updateUserProfile({ manual_cultura_aceito: true });
      toast.success('Manual de cultura aceito com sucesso!');
    } catch (error) {
      console.error('Erro ao aceitar manual:', error);
      toast.error('Erro ao aceitar o manual de cultura');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      <div className="grid gap-6 lg:gap-8 md:grid-cols-2 mt-6 lg:mt-8">
        <Card className="transition-all duration-200 shadow-none rounded-xl md:col-span-2 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-400 font-normal">Missão</CardTitle>
          </CardHeader>
          <CardContent className="px-4 lg:px-[20px] py-6 lg:py-[30px]">
            <p className="leading-tight text-zinc-950 text-center px-2 lg:px-4 md:px-[240px] text-xl lg:text-3xl font-medium py-2 lg:py-[14px]">
              {companyMission || "Transformar criatividade em estratégia. Marcas em movimento. Ideias em legado."}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 transition-all duration-200 shadow-none rounded-xl bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-zinc-400">
              Nossos Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6 lg:py-[30px] px-4 lg:px-[20px]">
            <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-5">
              {values.length > 0 ? values.map((value: {
                title: string;
                description: string;
              }, index: number) => (
                <div key={index} className="p-6 lg:p-8 rounded-xl border bg-card text-card-foreground transition-colors hover:border-primary/20">
                  <div className="mb-4" style={{ color: companyColor }}>
                    <span 
                      className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 text-sm font-semibold rounded-full" 
                      style={{
                        backgroundColor: `${companyColor}20`,
                        color: companyColor
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-medium mb-2">{value.title || 'Valor'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {value.description || 'Descrição do valor'}
                  </p>
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">Nenhum valor cadastrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {videoUrl && (
          <Card className="md:col-span-2 transition-all duration-200 shadow-none rounded-xl bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <CardContent className="p-0">
              <VideoPlayer 
                videoUrl={videoUrl} 
                description={videoDescription || ''} 
              />
            </CardContent>
          </Card>
        )}

        {companyHistory && (
          <Card className="md:col-span-2 transition-all duration-200 shadow-none rounded-xl bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <CardContent className="p-0">
              <div 
                className="py-12 lg:py-20 px-4 lg:px-8"
                style={{
                  background: `linear-gradient(135deg, ${companyColor}06 0%, ${companyColor}02 50%, white 100%)`
                }}
              >
                {/* Header centralizado com foto do usuário e logo da empresa */}
                <div className="text-center mb-10 lg:mb-16 max-w-4xl mx-auto">
                  {userProfile && (
                    <div className="flex justify-center items-center mb-6 lg:mb-10 relative">
                      <Avatar className="w-12 h-12 lg:w-20 lg:h-20">
                        <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || ""} />
                        <AvatarFallback 
                          className="text-white font-semibold text-sm lg:text-lg"
                          style={{ backgroundColor: companyColor }}
                        >
                          {getInitials(userProfile.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div 
                        className="w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center overflow-hidden bg-white ml-[-8px] lg:ml-[-12px]"
                      >
                        <img 
                          src={companyLogo || "/placeholder.svg"} 
                          alt={`${companyName || 'Company'} Logo`} 
                          className="w-full h-full object-cover" 
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }} 
                        />
                      </div>
                    </div>
                  )}
                  
                  <h2 className="text-xl lg:text-3xl font-semibold text-gray-900 mb-3 lg:mb-4 tracking-tight">
                    Declaração de Cultura
                  </h2>
                  <div className="w-8 h-0.5 lg:w-12 lg:h-1 mx-auto mb-8 lg:mb-12 rounded-full" style={{ backgroundColor: companyColor }} />
                </div>
                
                {/* Conteúdo da carta centralizado */}
                <div className="max-w-4xl mx-auto text-center mb-10 lg:mb-16">
                  <div className="prose prose-lg mx-auto">
                    <p className="text-gray-800 leading-relaxed text-base lg:text-lg font-normal whitespace-pre-line">
                      {companyHistory}
                    </p>
                  </div>
                </div>
                
                {/* Assinatura centralizada */}
                <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-20">
                  <div className="w-12 h-0.5 lg:w-16 lg:h-0.5 mx-auto mb-4 lg:mb-6 rounded-full" style={{ backgroundColor: companyColor }} />
                  <p className="text-gray-500 text-sm lg:text-base mb-2 font-normal">
                    Com os melhores cumprimentos,
                  </p>
                  <p className="text-gray-800 font-medium text-base lg:text-lg">
                    Equipe de Gestão
                  </p>
                </div>

                {/* Seção de aceite integrada */}
                <div className="max-w-xl lg:max-w-2xl mx-auto">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-6 lg:p-10 text-center border border-gray-100/50 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-center justify-center mb-4 lg:mb-6">
                      <div 
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 lg:mb-0 lg:mr-4"
                        style={{ backgroundColor: `${companyColor}15` }}
                      >
                        <Sparkles className="h-5 w-5 lg:h-6 lg:w-6" style={{ color: companyColor }} />
                      </div>
                      <h3 className="text-lg lg:text-xl font-semibold tracking-tight">Aceite do Manual de Cultura</h3>
                    </div>
                    <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base leading-relaxed max-w-lg mx-auto">
                      {isManualAccepted 
                        ? "Você já aceitou este manual de cultura. Obrigado por fazer parte da nossa cultura organizacional."
                        : "Ao aceitar este manual, você confirma que leu e compreendeu nossa cultura, valores e missão, comprometendo-se a vivenciá-los no dia a dia."
                      }
                    </p>
                    <Button 
                      onClick={handleAcceptManual}
                      disabled={isManualAccepted || isUpdating}
                      style={{ 
                        backgroundColor: isManualAccepted ? companyColor : undefined,
                        borderColor: companyColor 
                      }}
                      variant={isManualAccepted ? "default" : "outline"}
                      size="lg"
                      className="px-6 lg:px-10 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-medium text-sm lg:text-base w-full lg:w-auto"
                    >
                      {isUpdating 
                        ? "Processando..." 
                        : isManualAccepted 
                          ? "✓ Manual Aceito" 
                          : "Aceitar Manual de Cultura"
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
