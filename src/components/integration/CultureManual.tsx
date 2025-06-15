
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
  videoUrl?: string;
  videoDescription?: string;
}

export const CultureManual: React.FC<CultureManualProps> = ({
  companyValues,
  companyMission,
  companyHistory,
  companyColor,
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
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-2 mt-8">
        <Card className="transition-all duration-200 shadow-none rounded-xl md:col-span-2 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-400 font-normal">Missão</CardTitle>
          </CardHeader>
          <CardContent className="px-[20px] py-[30px]">
            <p className="leading-tight text-zinc-950 text-center px-4 md:px-[240px] text-3xl font-medium py-[14px]">
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
          <CardContent className="py-[30px] px-[20px]">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {values.length > 0 ? values.map((value: {
                title: string;
                description: string;
              }, index: number) => (
                <div key={index} className="p-8 rounded-xl border bg-card text-card-foreground transition-colors hover:border-primary/20">
                  <div className="mb-4" style={{ color: companyColor }}>
                    <span 
                      className="inline-flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-full" 
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
          <Card className="md:col-span-2 transition-all duration-200 shadow-none rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-zinc-400">
                Vídeo Institucional
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <VideoPlayer 
                videoUrl={videoUrl} 
                description={videoDescription || ''} 
              />
            </CardContent>
          </Card>
        )}

        {companyHistory && (
          <div className="md:col-span-2 -mx-6">
            <div className="bg-white dark:bg-gray-50 py-16 px-6">
              {/* Header centralizado com foto do usuário e logo da empresa */}
              <div className="text-center mb-12 max-w-3xl mx-auto">
                {userProfile && (
                  <div className="flex justify-center items-center gap-4 mb-8">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || ""} />
                      <AvatarFallback 
                        className="text-white font-semibold"
                        style={{ backgroundColor: companyColor }}
                      >
                        {getInitials(userProfile.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden bg-white border-2" style={{
                      borderColor: companyColor
                    }}>
                      <img 
                        src={window.localStorage.getItem('selectedCompanyLogo') || "/placeholder.svg"} 
                        alt="Company Logo" 
                        className="w-full h-full object-contain p-2" 
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }} 
                      />
                    </div>
                  </div>
                )}
                
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Declaração de Cultura
                </h2>
                <div className="w-16 h-0.5 mx-auto mb-8" style={{ backgroundColor: companyColor }} />
              </div>
              
              {/* Conteúdo da carta centralizado */}
              <div className="max-w-4xl mx-auto text-center mb-12">
                <p className="text-gray-800 leading-relaxed text-sm font-mono whitespace-pre-line">
                  {companyHistory}
                </p>
              </div>
              
              {/* Assinatura centralizada */}
              <div className="text-center max-w-3xl mx-auto">
                <div className="w-24 h-0.5 mx-auto mb-4" style={{ backgroundColor: companyColor }} />
                <p className="text-gray-600 text-sm mb-1">
                  Com os melhores cumprimentos,
                </p>
                <p className="text-gray-800 font-medium">
                  Equipe de Gestão
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botão de aceite integrado com banco de dados */}
        <Card className="md:col-span-2 transition-all duration-200 shadow-none rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 mr-2" style={{ color: companyColor }} />
              <h3 className="text-xl font-semibold">Manual de Cultura</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              {isManualAccepted 
                ? "Você já aceitou este manual de cultura."
                : "Ao aceitar este manual, você confirma que leu e compreendeu nossa cultura, valores e missão."
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
            >
              {isUpdating 
                ? "Processando..." 
                : isManualAccepted 
                  ? "✓ Manual Aceito" 
                  : "Aceitar Manual de Cultura"
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
