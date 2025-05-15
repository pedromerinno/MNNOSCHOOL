
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
import { toast } from 'sonner';

const AdminPage = () => {
  const {
    userProfile,
    loading: authLoading
  } = useAuth();
  
  const location = useLocation();
  
  // Initialize with the appropriate default tab based on user role
  const [activeTab, setActiveTab] = useState(userProfile?.super_admin ? "platform" : "companies");
  const [isReady, setIsReady] = useState(false);

  // Handle URL params for tab selection on initial load and navigations
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
      
      // Get initial tab from URL params if present
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, [authLoading, location.search]);

  // Memoized tab change handler to prevent unnecessary rerenders
  const handleTabChange = useCallback((tab: string) => {
    console.log("Changing tab to:", tab);
    setActiveTab(tab);
  }, []);

  if (!isReady) {
    return <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex items-center justify-center">
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
        return <CompanyManagement />;
      case "users":
        return <UserManagement />;
      case "allcourses":
        return <CourseManagement />;
      case "notices":
        return <CompanyNoticesAdminList />;
      case "settings":
        return <SettingsManagement />;
      default:
        return null;
    }
  };

  return <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <div className="container mx-auto px-0 lg:px-4 py-6 max-w-[1500px]">
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full min-h-[calc(100vh-120px)] rounded-lg overflow-hidden">
            <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="flex-1 overflow-auto">
              <div className="p-6">
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
