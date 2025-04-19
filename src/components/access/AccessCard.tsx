
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Key, Copy } from "lucide-react";
import { AccessItem } from './types';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AccessCardProps {
  item: AccessItem;
  onClick: () => void;
  companyColor?: string;
}

export const AccessCard = ({ item, onClick, companyColor }: AccessCardProps) => {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type} copiado para área de transferência`))
      .catch(() => toast.error('Falha ao copiar'));
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer group dark:hover:shadow-gray-800 relative overflow-hidden"
      onClick={onClick}
      style={{
        borderColor: companyColor || undefined,
        borderWidth: companyColor ? '1px' : undefined
      }}
    >
      <div 
        className="absolute top-0 left-0 w-full h-1 opacity-80"
        style={{ backgroundColor: companyColor }}
      />
      
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="dark:text-white">{item.tool_name}</span>
          {item.url && (
            <a 
              href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={18} />
            </a>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Key size={20} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium dark:text-white">{item.username}</p>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.username, 'Usuário');
                }}
              >
                <Copy size={14} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Usuário</p>
          </div>
        </div>

        <div className="border-t border-border pt-3 mt-3">
          <p className="text-xs text-muted-foreground">
            Clique para ver a senha e mais detalhes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
