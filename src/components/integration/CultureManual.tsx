import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { VideoPlayer } from './video-playlist/VideoPlayer';
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
  const [accepted, setAccepted] = useState(false);

  // Handle values with improved error handling
  const getValues = () => {
    if (!companyValues) return [];
    if (typeof companyValues === 'string') {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(companyValues);
        // If parsed is an array, return it
        if (Array.isArray(parsed)) {
          return parsed;
        }
        // If parsed is an object but not array, wrap it
        return [parsed];
      } catch (error) {
        console.error('Error parsing company values:', error);
        // If it's not valid JSON, check if it might be a single value
        if (companyValues.trim()) {
          return [{
            title: 'Valor',
            description: companyValues
          }];
        }
        return [];
      }
    }

    // Handle array values
    if (Array.isArray(companyValues)) {
      return companyValues;
    }

    // Handle object values by wrapping them in an array
    if (typeof companyValues === 'object' && companyValues !== null) {
      return [companyValues];
    }
    return [];
  };
  const values = getValues();
  return <div className="space-y-12"> {/* Removed pb-12 to let the container spacing handle it */}
      <div className="grid gap-8 md:grid-cols-2 mt-8">
        <Card className="transition-all duration-200 shadow-none rounded-xl md:col-span-2 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-400 font-normal">Missão</CardTitle>
          </CardHeader>
          <CardContent className="px-[20px] py-[30px]">
            <p className="leading-relaxed font-semibold text-zinc-950 text-3xl text-center py-[20px] px-[240px]">
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
            <div className="grid gap-6 md:grid-cols-5">
              {values.length > 0 ? values.map((value: {
              title: string;
              description: string;
            }, index: number) => <div key={index} className="p-8 rounded-xl border bg-card text-card-foreground transition-colors hover:border-primary/20">
                    <div className="mb-4" style={{
                color: companyColor
              }}>
                      <span className="inline-flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-full" style={{
                  backgroundColor: `${companyColor}20`,
                  color: companyColor
                }}>
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="font-medium mb-2">{value.title || 'Valor'}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {value.description || ''}
                    </p>
                  </div>) : <div className="md:col-span-5 text-center py-6">
                  <p className="text-gray-500">Nenhum valor definido para esta empresa ainda.</p>
                </div>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 transition-all duration-200 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-400 font-normal">
              Vídeo Institucional
            </CardTitle>
          </CardHeader>
          <CardContent className="px-[40px] py-[40px]">
            {videoUrl ? <VideoPlayer videoUrl={videoUrl} description={videoDescription || ''} /> : <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Vídeo institucional não disponível no momento.
                </p>
              </div>}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-6 pt-8">
        <Button className="relative group overflow-hidden rounded-xl px-8 py-6 text-lg font-medium" style={{
        backgroundColor: companyColor || '#1EAEDB'
      }} onClick={() => setAccepted(!accepted)}>
          <span className="relative z-10 flex items-center gap-2">
            {accepted ? <>
                <Sparkles className="h-5 w-5" />
                Cultura aceita
              </> : "Quero fazer parte disso"}
          </span>
        </Button>
        
        <div className="flex items-center gap-2 py-[20px] px-[20px]">
          <input type="checkbox" id="culture-accept" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="rounded border-gray-300" />
          <label htmlFor="culture-accept" className="text-sm text-gray-600 dark:text-gray-400">
            Li e estou alinhado com a cultura da empresa
          </label>
        </div>
      </div>
    </div>;
};