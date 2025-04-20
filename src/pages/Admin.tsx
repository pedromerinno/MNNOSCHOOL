
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { SettingsManagement } from '@/components/admin/integration/SettingsManagement';
import { BackgroundManager } from '@/components/admin/BackgroundManager';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Building, Settings, Book, Image } from 'lucide-react';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

// Helper para cor principal (azul padrão caso não tenha)
const ADMIN_MAIN_COLOR = "#1EAEDB";
const getLighterAdminColor = (opacity = 0.1) =>
  `rgba(30, 174, 219, ${opacity})`; // azul #1EAEDB

const AdminPage = () => {
  const { userProfile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        {/* Novo título com visual idêntico às outras páginas */}
        <div className="flex items-center gap-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 tracking-tight">
            Painel Administrativo
          </h1>
          {/* Espaço para badge ou complemento futuro */}
        </div>

        <Card className="mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Novo estilo das abas, igual da Comunidade */}
              <div className="border-b border-gray-100 dark:border-gray-800 py-2 px-2 bg-transparent">
                <TabsList className="flex gap-2 rounded-2xl p-1.5 bg-transparent dark:bg-transparent w-full justify-start">
                  <TabsTrigger 
                    value="users"
                    className={`flex items-center gap-2 rounded-xl py-3 px-6 transition-colors border border-transparent text-gray-600 dark:text-gray-300
                      ${activeTab === "users" 
                        ? "bg-[rgba(30,174,219,0.1)] text-[#1EAEDB] border-[#1EAEDB]"
                        : "hover:bg-[rgba(30,174,219,0.05)]"
                      }
                    `}
                    style={{
                      backgroundColor: activeTab === "users" ? getLighterAdminColor(0.15) : undefined,
                      borderColor: activeTab === "users" ? ADMIN_MAIN_COLOR : "transparent",
                      color: activeTab === "users" ? ADMIN_MAIN_COLOR : undefined
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Usuários
                  </TabsTrigger>
                  <TabsTrigger 
                    value="companies"
                    className={`flex items-center gap-2 rounded-xl py-3 px-6 transition-colors border border-transparent text-gray-600 dark:text-gray-300
                      ${activeTab === "companies" 
                        ? "bg-[rgba(30,174,219,0.1)] text-[#1EAEDB] border-[#1EAEDB]"
                        : "hover:bg-[rgba(30,174,219,0.05)]"
                      }
                    `}
                    style={{
                      backgroundColor: activeTab === "companies" ? getLighterAdminColor(0.15) : undefined,
                      borderColor: activeTab === "companies" ? ADMIN_MAIN_COLOR : "transparent",
                      color: activeTab === "companies" ? ADMIN_MAIN_COLOR : undefined
                    }}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Empresas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="allcourses"
                    className={`flex items-center gap-2 rounded-xl py-3 px-6 transition-colors border border-transparent text-gray-600 dark:text-gray-300
                      ${activeTab === "allcourses" 
                        ? "bg-[rgba(30,174,219,0.1)] text-[#1EAEDB] border-[#1EAEDB]"
                        : "hover:bg-[rgba(30,174,219,0.05)]"
                      }
                    `}
                    style={{
                      backgroundColor: activeTab === "allcourses" ? getLighterAdminColor(0.15) : undefined,
                      borderColor: activeTab === "allcourses" ? ADMIN_MAIN_COLOR : "transparent",
                      color: activeTab === "allcourses" ? ADMIN_MAIN_COLOR : undefined
                    }}
                  >
                    <Book className="h-4 w-4 mr-2" />
                    Todos os Cursos
                  </TabsTrigger>
                  {userProfile?.super_admin && (
                    <TabsTrigger
                      value="background"
                      className={`flex items-center gap-2 rounded-xl py-3 px-6 transition-colors border border-transparent text-gray-600 dark:text-gray-300
                        ${activeTab === "background" 
                          ? "bg-[rgba(30,174,219,0.1)] text-[#1EAEDB] border-[#1EAEDB]"
                          : "hover:bg-[rgba(30,174,219,0.05)]"
                        }
                      `}
                      style={{
                        backgroundColor: activeTab === "background" ? getLighterAdminColor(0.15) : undefined,
                        borderColor: activeTab === "background" ? ADMIN_MAIN_COLOR : "transparent",
                        color: activeTab === "background" ? ADMIN_MAIN_COLOR : undefined
                      }}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Background
                    </TabsTrigger>
                  )}
                  <TabsTrigger 
                    value="settings"
                    className={`flex items-center gap-2 rounded-xl py-3 px-6 transition-colors border border-transparent text-gray-600 dark:text-gray-300
                      ${activeTab === "settings" 
                        ? "bg-[rgba(30,174,219,0.1)] text-[#1EAEDB] border-[#1EAEDB]"
                        : "hover:bg-[rgba(30,174,219,0.05)]"
                      }
                    `}
                    style={{
                      backgroundColor: activeTab === "settings" ? getLighterAdminColor(0.15) : undefined,
                      borderColor: activeTab === "settings" ? ADMIN_MAIN_COLOR : "transparent",
                      color: activeTab === "settings" ? ADMIN_MAIN_COLOR : undefined
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <ErrorBoundary>
                  <TabsContent value="users" className="m-0">
                    <UserManagement />
                  </TabsContent>
                  <TabsContent value="companies" className="m-0">
                    <CompanyManagement />
                  </TabsContent>
                  <TabsContent value="allcourses" className="m-0">
                    <CourseManagement />
                  </TabsContent>
                  {userProfile?.super_admin && (
                    <TabsContent value="background" className="m-0">
                      <BackgroundManager />
                    </TabsContent>
                  )}
                  <TabsContent value="settings" className="m-0">
                    <SettingsManagement />
                  </TabsContent>
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
