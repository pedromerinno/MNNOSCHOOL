
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessContent } from "./AccessContent";
import { UserAccessManagement } from "./UserAccessManagement";
import { AccessItem } from "./types";

interface AccessTabsProps {
  companyAccessItems: AccessItem[];
  companyColor?: string;
  onAccessUpdated?: () => void;
}

export const AccessTabs = ({ companyAccessItems, companyColor, onAccessUpdated }: AccessTabsProps) => {
  return (
    <Tabs defaultValue="shared" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="shared">Senhas Compartilhadas</TabsTrigger>
        <TabsTrigger value="personal">Minhas Senhas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="shared" className="mt-6">
        <AccessContent 
          items={companyAccessItems} 
          companyColor={companyColor}
          onAccessUpdated={onAccessUpdated}
        />
      </TabsContent>
      
      <TabsContent value="personal" className="mt-6">
        <UserAccessManagement />
      </TabsContent>
    </Tabs>
  );
};
