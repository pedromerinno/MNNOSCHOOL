
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

// Novo esquema de cores para contraste e estilo sem bordas para a aba ativa
const ADMIN_PRIMARY_COLOR = "#9b87f5";  // purple principal para active tab
const ADMIN_ACTIVE_BG = "#1A1F2C";       // fundo escuro para aba ativa

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
        {/* Título com estilo uniforme das páginas integração, documentos e comunidade */}
        <div className="flex items-center gap-4 mb-12">
          <h1 className="text-4xl font-extrabold dark:text-white text-black tracking-tight">
            Painel Administrativo
          </h1>
        </div>

        <Card className="mb-8 shadow-md border border-gray-100 dark:border-gray-800">
          <CardContent className="p-8"> {/* Aumentado padding para 8 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Novo estilo abas similar ao da comunidade */}
              <div className="border-b border-gray-100 dark:border-gray-800 py-3 px-2 bg-transparent">
                <TabsList className="flex gap-2 rounded-2xl p-1.5 bg-transparent dark:bg-transparent w-full justify-start">
                  <TabsTrigger 
                    value="users"
                    className={`flex items-center gap-2 rounded-xl py-4 px-8 transition-colors text-lg
                      ${activeTab === "users"
                        ? "bg-[#1A1F2C] text-[#9b87f5] shadow-md" 
                        : "text-gray-500 dark:text-gray-400 hover:text-[#9b87f5]"
                      }
                    `}
                    style={{
                      border: "none",
                    }}
                  >
                    <Users className="h-5 w-5" />
                    Usuários
                  </TabsTrigger>
                  <TabsTrigger 
                    value="companies"
                    className={`flex items-center gap-2 rounded-xl py-4 px-8 transition-colors text-lg
                      ${activeTab === "companies"
                        ? "bg-[#1A1F2C] text-[#9b87f5] shadow-md" 
                        : "text-gray-500 dark:text-gray-400 hover:text-[#9b87f5]"
                      }
                    `}
                    style={{
                      border: "none",
                    }}
                  >
                    <Building className="h-5 w-5" />
                    Empresas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="allcourses"
                    className={`flex items-center gap-2 rounded-xl py-4 px-8 transition-colors text-lg
                      ${activeTab === "allcourses"
                        ? "bg-[#1A1F2C] text-[#9b87f5] shadow-md" 
                        : "text-gray-500 dark:text-gray-400 hover:text-[#9b87f5]"
                      }
                    `}
                    style={{
                      border: "none",
                    }}
                  >
                    <Book className="h-5 w-5" />
                    Todos os Cursos
                  </TabsTrigger>
                  {userProfile?.super_admin && (
                    <TabsTrigger
                      value="background"
                      className={`flex items-center gap-2 rounded-xl py-4 px-8 transition-colors text-lg
                        ${activeTab === "background"
                          ? "bg-[#1A1F2C] text-[#9b87f5] shadow-md" 
                          : "text-gray-500 dark:text-gray-400 hover:text-[#9b87f5]"
                        }
                      `}
                      style={{
                        border: "none",
                      }}
                    >
                      <Image className="h-5 w-5" />
                      Background
                    </TabsTrigger>
                  )}
                  <TabsTrigger 
                    value="settings"
                    className={`flex items-center gap-2 rounded-xl py-4 px-8 transition-colors text-lg
                      ${activeTab === "settings"
                        ? "bg-[#1A1F2C] text-[#9b87f5] shadow-md" 
                        : "text-gray-500 dark:text-gray-400 hover:text-[#9b87f5]"
                      }
                    `}
                    style={{
                      border: "none",
                    }}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-4">
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
