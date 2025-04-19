
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Users, TrendingUp, Pen, Target, PlayCircle, Sparkles } from "lucide-react";
import { VideoPlayer } from './video-playlist/VideoPlayer';

interface CultureManualProps {
  companyValues: string;
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
  
  const values = companyValues ? JSON.parse(companyValues) : [];

  return (
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="transition-all duration-200 shadow-none rounded-xl md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <Star style={{ color: companyColor }} className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">Missão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-xl font-medium leading-relaxed">
              {companyMission || "Transformar criatividade em estratégia. Marcas em movimento. Ideias em legado."}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 transition-all duration-200 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star style={{ color: companyColor }} className="h-6 w-6" />
              Nossos Valores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-5">
              {values.map((value: { title: string; description: string }, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border bg-card text-card-foreground transition-colors hover:border-primary/20"
                >
                  <div className="mb-3" style={{ color: companyColor }}>
                    <Star className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 transition-all duration-200 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <PlayCircle style={{ color: companyColor }} className="h-6 w-6" />
              Vídeo Institucional
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videoUrl ? (
              <VideoPlayer videoUrl={videoUrl} description={videoDescription || ''} />
            ) : (
              <div className="text-center py-12">
                <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Vídeo institucional não disponível no momento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-6 pt-8">
        <Button
          className="relative group overflow-hidden rounded-xl px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: companyColor || '#1EAEDB',
          }}
          onClick={() => setAccepted(!accepted)}
        >
          <span className="relative z-10 flex items-center gap-2">
            {accepted ? (
              <>
                <Sparkles className="h-5 w-5" />
                Cultura aceita
              </>
            ) : (
              "Quero fazer parte disso"
            )}
          </span>
          <div
            className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
            style={{ mixBlendMode: 'overlay' }}
          />
        </Button>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="culture-accept"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="culture-accept" className="text-sm text-gray-600 dark:text-gray-400">
            Li e estou alinhado com a cultura da empresa
          </label>
        </div>
      </div>
    </div>
  );
};
