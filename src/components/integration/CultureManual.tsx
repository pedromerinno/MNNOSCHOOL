
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, History, Star, Users, TrendingUp, Pen, Target, PlayCircle } from "lucide-react";

interface CultureManualProps {
  companyValues: string;
  companyMission: string;
  companyHistory: string;
  companyColor: string;
}

export const CultureManual: React.FC<CultureManualProps> = ({
  companyValues,
  companyMission,
  companyHistory,
  companyColor
}) => {
  const [accepted, setAccepted] = useState(false);

  const values = [
    { icon: <Check className="h-5 w-5" />, title: "Excelência", description: "Cuidamos do que entregamos" },
    { icon: <Pen className="h-5 w-5" />, title: "Autenticidade", description: "Somos autorais" },
    { icon: <Target className="h-5 w-5" />, title: "Comprometimento", description: "Levamos até o fim" },
    { icon: <Users className="h-5 w-5" />, title: "Colaboração", description: "Criamos juntos" },
    { icon: <TrendingUp className="h-5 w-5" />, title: "Evolução", description: "Aprendemos sempre" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-semibold">Manual de Cultura MERINNO</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Tudo o que você precisa saber para entender nossa história, nossos valores e o tipo de profissional que acreditamos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center gap-4">
            <History style={{ color: companyColor }} className="h-8 w-8" />
            <div>
              <CardTitle className="text-lg">Nossa História</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
              {companyHistory || "História não disponível"}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Ler mais
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nossa História</DialogTitle>
                </DialogHeader>
                <div className="mt-4 whitespace-pre-line">
                  {companyHistory || "História não disponível"}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center gap-4">
            <Star style={{ color: companyColor }} className="h-8 w-8" />
            <div>
              <CardTitle className="text-lg">Missão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              {companyMission || "Transformar criatividade em estratégia. Marcas em movimento. Ideias em legado."}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star style={{ color: companyColor }} className="h-6 w-6" />
              Nossos Valores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card text-card-foreground hover:shadow-sm transition-shadow"
                >
                  <div className="mb-2" style={{ color: companyColor }}>
                    {value.icon}
                  </div>
                  <h3 className="font-medium mb-1">{value.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PlayCircle style={{ color: companyColor }} className="h-6 w-6" />
              Vídeo de Boas-vindas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Em breve nosso vídeo de cultura e bastidores do time MERINNO.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-4 pt-6">
        <Button
          className="relative group overflow-hidden"
          style={{
            backgroundColor: companyColor || '#1EAEDB',
            transition: 'transform 0.2s',
          }}
          onClick={() => setAccepted(!accepted)}
        >
          <span className="relative z-10">
            {accepted ? "Cultura aceita ✨" : "Quero fazer parte disso"}
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
            Li e estou alinhado com a cultura MERINNO
          </label>
        </div>
      </div>
    </div>
  );
};
