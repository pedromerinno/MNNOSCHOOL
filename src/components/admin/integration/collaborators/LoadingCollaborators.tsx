
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const LoadingCollaborators: React.FC = () => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
        <p className="mt-2 text-gray-500">Carregando colaboradores...</p>
      </CardContent>
    </Card>
  );
};
