
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { IntegrationManagement } from '@/components/admin/integration/IntegrationManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Building, Book, Video } from 'lucide-react';

const AdminPage = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  
  if (userProfile?.isAdmin !== true) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Painel Administrativo</h1>
        
        <Card className="mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-100 dark:border-gray-800">
                <TabsList className="bg-gray-50 dark:bg-gray-900 w-full justify-start rounded-none p-0 h-auto">
                  <TabsTrigger 
                    value="users" 
                    className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Usuários
                  </TabsTrigger>
                  <TabsTrigger 
                    value="companies" 
                    className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Empresas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="courses" 
                    className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                  >
                    <Book className="h-4 w-4 mr-2" />
                    Cursos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="integration" 
                    className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Integração
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="users" className="m-0">
                  <UserManagement />
                </TabsContent>
                <TabsContent value="companies" className="m-0">
                  <CompanyManagement />
                </TabsContent>
                <TabsContent value="courses" className="m-0">
                  <CourseManagement />
                </TabsContent>
                <TabsContent value="integration" className="m-0">
                  <IntegrationManagement />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPage;
