
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";

export const NoVideosAvailable: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-12 text-center">
          <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Sem vídeos disponíveis</h3>
          <p className="text-gray-500">
            Não há vídeos de integração disponíveis para esta empresa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
