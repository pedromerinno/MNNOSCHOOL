import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { UserManagement } from '@/components/admin/UserManagement';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { SettingsManagement } from '@/components/admin/integration/SettingsManagement';
import { BackgroundManager } from '@/components/admin/BackgroundManager';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { CompanyNoticesAdminList } from '@/components/admin/CompanyNoticesAdminList';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
const AdminPage = () => {
  const {
    userProfile,
    loading: authLoading
  } = useAuth();
  const [activeTab, setActiveTab] = useState(userProfile?.super_admin ? "platform" : "companies");
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);
  if (!isReady) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>;
  }
  if (!userProfile?.is_admin && !userProfile?.super_admin) {
    return <Navigate to="/" replace />;
  }
  const getActiveContent = () => {
    switch (activeTab) {
      case "platform":
        return <BackgroundManager />;
      case "companies":
        return <div>
            <CompanyManagement />
            <div className="mt-10">
              <CompanyNoticesAdminList />
            </div>
          </div>;
      case "users":
        return <UserManagement />;
      case "allcourses":
        return <CourseManagement />;
      case "settings":
        return <SettingsManagement />;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-0 lg:px-4 py-6">
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full min-h-[calc(100vh-120px)] rounded-lg overflow-hidden">
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8 py-[10px]">
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={() => window.history.back()} aria-label="Voltar">
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                  </Button>
                  <h1 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-900 tracking-tight">
                    Painel Administrativo
                  </h1>
                </div>
                <ErrorBoundary>
                  {getActiveContent()}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>;
};
export default AdminPage;