
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Quote } from "lucide-react";
import { VideoPlayer } from './video-playlist/VideoPlayer';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
          <div className="md:col-span-2 relative">
            {/* Background decorativo */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-5"
              style={{ backgroundColor: companyColor }}
            />
            <div 
              className="absolute top-8 left-8 w-24 h-24 rounded-full opacity-10"
              style={{ backgroundColor: companyColor }}
            />
            <div 
              className="absolute bottom-8 right-8 w-16 h-16 rounded-full opacity-10"
              style={{ backgroundColor: companyColor }}
            />
            
            {/* Conteúdo principal */}
            <Card className="relative transition-all duration-200 shadow-lg rounded-3xl border-0 overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-full h-2"
                style={{ backgroundColor: companyColor }}
              />
              
              <CardHeader className="text-center pb-6 pt-8">
                <div className="flex items-center justify-center mb-4">
                  <div 
                    className="p-3 rounded-full mr-4"
                    style={{ backgroundColor: `${companyColor}20` }}
                  >
                    <Quote 
                      className="h-6 w-6" 
                      style={{ color: companyColor }} 
                    />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                    Nossa Declaração de Cultura
                  </CardTitle>
                </div>
                <div 
                  className="w-20 h-1 mx-auto rounded-full"
                  style={{ backgroundColor: companyColor }}
                />
              </CardHeader>
              
              <CardContent className="px-12 py-8">
                <div className="relative">
                  {/* Quote marks decorativas */}
                  <div 
                    className="absolute -top-4 -left-4 text-6xl font-serif opacity-20"
                    style={{ color: companyColor }}
                  >
                    "
                  </div>
                  <div 
                    className="absolute -bottom-8 -right-4 text-6xl font-serif opacity-20 rotate-180"
                    style={{ color: companyColor }}
                  >
                    "
                  </div>
                  
                  <div className="prose prose-lg dark:prose-invert max-w-none text-center">
                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg font-medium whitespace-pre-line relative z-10">
                      {companyHistory}
                    </p>
                  </div>
                </div>
                
                {/* Elementos decorativos na parte inferior */}
                <div className="flex justify-center mt-8 space-x-2">
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: companyColor }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
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
