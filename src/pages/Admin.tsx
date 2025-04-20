
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { SettingsManagement } from '@/components/admin/integration/SettingsManagement';
import { BackgroundManager } from '@/components/admin/BackgroundManager';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Users, Book, Settings, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Button } from '@/components/ui/button';

// Helper para cor principal (azul padrão caso não tenha)
const ADMIN_MAIN_COLOR = "#1EAEDB";
const getLighterAdminColor = (opacity = 0.1) =>
  `rgba(30, 174, 219, ${opacity})`; // azul #1EAEDB

const AdminPage = () => {
  const { userProfile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(
    userProfile?.super_admin ? "platform" : "companies"
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userProfile?.is_admin && !userProfile?.super_admin) {
    return <Navigate to="/" replace />;
  }

  // Tabs definition (order and label)
  const tabs = [
    ...(userProfile?.super_admin ? [{
      value: "platform",
      label: "Plataforma",
      icon: LayoutDashboard,
      content: <BackgroundManager />,
    }] : []),
    {
      value: "companies",
      label: "Empresas",
      icon: Building,
      content: <CompanyManagement />
    },
    {
      value: "users",
      label: "Usuários",
      icon: Users,
      content: <UserManagement />
    },
    {
      value: "allcourses",
      label: "Cursos",
      icon: Book,
      content: <CourseManagement />
    },
    {
      value: "settings",
      label: "Configurações da Empresa",
      icon: Settings,
      content: <SettingsManagement />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        {/* Novo título com visual idêntico às outras páginas */}
        <div className="flex items-center gap-4 mb-12">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 tracking-tight">
            Painel Administrativo
          </h1>
        </div>

        <Card className="mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <CardContent className="p-8"> {/* Padding reduzido de p-12 para p-8 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-100 dark:border-gray-800 py-2 px-2 bg-transparent">
                <TabsList className="flex gap-2 rounded-2xl p-1.5 bg-transparent dark:bg-transparent w-full justify-start">
                  {tabs.map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex items-center gap-2 rounded-xl py-3 px-6 transition-colors border border-transparent 
                        ${activeTab === tab.value
                          ? "bg-black text-white"
                          : "text-gray-600 dark:text-gray-300 hover:bg-[rgba(30,174,219,0.05)]"
                        }
                      `}
                      style={{
                        backgroundColor: activeTab === tab.value ? 'black' : undefined,
                        borderColor: "transparent",
                        color: activeTab === tab.value ? 'white' : undefined,
                      }}
                    >
                      <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.value ? "text-white" : ""}`} />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="p-4"> {/* Padding reduzido de p-6 para p-4 para harmonizar com as tabelas */}
                <ErrorBoundary>
                  {tabs.map(tab => (
                    <TabsContent key={tab.value} value={tab.value} className="m-0">
                      {tab.content}
                    </TabsContent>
                  ))}
                </ErrorBoundary>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPage;

