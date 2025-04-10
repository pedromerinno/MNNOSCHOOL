import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FileText, Settings, Users, Globe, Building, Book, RefreshCw, VideoIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { IntegrationManagement } from '@/components/admin/integration/IntegrationManagement';
import { useAuth } from '@/contexts/AuthContext';

const AdminPage = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  
  if (userProfile?.isAdmin !== true) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const adminSections = [
    { 
      title: 'Integração', 
      description: 'Gerencie informações de contratação', 
      icon: FileText, 
      path: '/admin/integration' 
    },
    { 
      title: 'Acessos', 
      description: 'Configurar ferramentas e acessos', 
      icon: Settings, 
      path: '/admin/access' 
    },
    { 
      title: 'Documentos', 
      description: 'Gerenciar documentos e contratos', 
      icon: Users, 
      path: '/admin/documents' 
    },
    { 
      title: 'Comunidade', 
      description: 'Configurações de comunicação', 
      icon: Globe, 
      path: '/community' 
    },
  ];

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
                    <VideoIcon className="h-4 w-4 mr-2" />
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminSections.map((section) => (
            <Card 
              key={section.title} 
              className="hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <section.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium text-lg dark:text-white">{section.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {section.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  asChild
                >
                  <a href={section.path}>Gerenciar</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
