import React, { ReactNode } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { MyCoursesSidebar } from './MyCoursesSidebar';
import { AdminFloatingActionButton } from '@/components/admin/AdminFloatingActionButton';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface MyCoursesLayoutProps {
  children: ReactNode;
}

export const MyCoursesLayout = ({ children }: MyCoursesLayoutProps) => {
  return (
    <div className="my-courses-layout min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full h-screen overflow-hidden relative">
          {/* Sidebar */}
          <MyCoursesSidebar />
          
          {/* Conteúdo principal */}
          <main className="flex-1 flex flex-col lg:ml-64 bg-transparent overflow-y-auto">
            {/* Header mobile com trigger */}
            <header className="sticky top-0 z-40 w-full border-b bg-[#F8F7F4] dark:bg-[#191919] px-4 py-3 flex items-center gap-4 lg:hidden">
              <SidebarTrigger />
            </header>
            
            {/* Conteúdo */}
            <div className="flex-1 w-full p-4 lg:p-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </SidebarProvider>
      <AdminFloatingActionButton />
    </div>
  );
};