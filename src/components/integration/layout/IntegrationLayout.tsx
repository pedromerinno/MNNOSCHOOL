
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface IntegrationLayoutProps {
  children: React.ReactNode;
}

export const IntegrationLayout: React.FC<IntegrationLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <div className="flex items-center mb-12 gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <h1 className="text-3xl font-bold dark:text-white">
            Bem-vindo ao processo de integração
          </h1>
        </div>
        
        <div className="bg-white dark:bg-card rounded-xl shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
};
