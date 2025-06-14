
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessContent } from "./AccessContent";
import { UserAccessManagement } from "./UserAccessManagement";
import { AccessItem } from "./types";

interface AccessTabsProps {
  companyAccessItems: AccessItem[];
  companyColor?: string;
}

export const AccessTabs: React.FC<AccessTabsProps> = ({
  companyAccessItems,
  companyColor
}) => {
  return (
    <Tabs defaultValue="shared" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="shared">Senhas Compartilhadas</TabsTrigger>
        <TabsTrigger value="personal">Minhas Senhas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="shared" className="space-y-4">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Senhas Compartilhadas</h3>
            <p className="text-sm text-muted-foreground">
              Acessos compartilhados pela empresa para uso da equipe
            </p>
          </div>
          <AccessContent 
            items={companyAccessItems}
            companyColor={companyColor}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="personal" className="space-y-4">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
          <UserAccessManagement companyColor={companyColor} />
        </div>
      </TabsContent>
    </Tabs>
  );
};
