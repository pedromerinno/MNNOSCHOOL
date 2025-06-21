
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessContent } from "./AccessContent";
import { UserAccessManagement } from "./UserAccessManagement";
import { AccessItem } from "./types";
import { Share2, User } from "lucide-react";

interface AccessTabsProps {
  companyAccessItems: AccessItem[];
  companyColor?: string;
  onAccessUpdated?: () => void;
}

export const AccessTabs = ({ companyAccessItems, companyColor = "#1EAEDB", onAccessUpdated }: AccessTabsProps) => {
  const [activeTab, setActiveTab] = React.useState("shared");

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full rounded-2xl p-1.5 gap-2 bg-gray-100/0">
          <TabsTrigger 
            value="shared" 
            className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors" 
            style={{
              backgroundColor: activeTab === "shared" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "shared" ? companyColor : undefined,
              color: activeTab === "shared" ? companyColor : undefined
            }}
          >
            <Share2 className="h-4 w-4" />
            Senhas Compartilhadas
          </TabsTrigger>
          
          <TabsTrigger 
            value="personal" 
            className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors" 
            style={{
              backgroundColor: activeTab === "personal" ? `${companyColor}10` : undefined,
              borderColor: activeTab === "personal" ? companyColor : undefined,
              color: activeTab === "personal" ? companyColor : undefined
            }}
          >
            <User className="h-4 w-4" />
            Minhas Senhas
          </TabsTrigger>
        </TabsList>

        <div className="mt-10 mb-16 space-y-8">
          <TabsContent value="shared" className="m-0">
            <AccessContent 
              items={companyAccessItems} 
              companyColor={companyColor}
              onAccessUpdated={onAccessUpdated}
            />
          </TabsContent>
          
          <TabsContent value="personal" className="m-0">
            <UserAccessManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
