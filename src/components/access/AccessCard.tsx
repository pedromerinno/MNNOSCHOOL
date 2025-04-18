
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Key } from "lucide-react";
import { AccessItem } from './types';

interface AccessCardProps {
  item: AccessItem;
  onClick: () => void;
  companyColor?: string;
}

export const AccessCard = ({ item, onClick, companyColor }: AccessCardProps) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      style={{
        borderColor: companyColor || undefined,
        borderWidth: '1px'
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="dark:text-white">{item.tool_name}</span>
          {item.url && (
            <a 
              href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={18} />
            </a>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mr-3">
            <Key size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Usuário</p>
            <p className="font-medium dark:text-white">{item.username}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Clique para ver detalhes completos e copiar as credenciais
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
