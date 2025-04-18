
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BriefcaseBusiness, Building, Star } from "lucide-react";

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
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <Building style={{ color: companyColor }} className="h-8 w-8" />
          <div>
            <CardTitle className="text-lg">Nossa História</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {companyHistory || "História não disponível"}
          </p>
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
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {companyMission || "Missão não disponível"}
          </p>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-md md:col-span-2">
        <CardHeader className="flex flex-row items-center gap-4">
          <BookOpen style={{ color: companyColor }} className="h-8 w-8" />
          <div>
            <CardTitle className="text-lg">Valores</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {companyValues || "Valores não disponíveis"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
