
import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import CourseDetails from "./pages/CourseDetails";
import LessonPage from "./pages/LessonPage";
import NotFound from "./pages/NotFound";
import Integration from "./pages/Integration";
import Access from "./pages/Access";
import Documents from "./pages/Documents";
import School from "./pages/School";
import Community from "./pages/Community";
import Admin from "./pages/Admin";
import Notes from "./pages/Notes";
import Manifesto from "./pages/Manifesto";
import Team from "./pages/Team";
import TeamMemberProfile from "./pages/TeamMemberProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      suspense: false, // Disable React Query's suspense mode
    },
  },
});

// Simple loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const PageWithNavigation = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <MainNavigationMenu />
    {children}
  </ErrorBoundary>
);

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/" element={<PageWithNavigation><Index /></PageWithNavigation>} />
                  
                  <Route path="/courses" element={<PageWithNavigation><Courses /></PageWithNavigation>} />
                  <Route path="/my-courses" element={<PageWithNavigation><MyCourses /></PageWithNavigation>} />
                  <Route path="/courses/:courseId" element={<PageWithNavigation><CourseDetails /></PageWithNavigation>} />
                  <Route path="/courses/:courseId/lessons/:lessonId" element={
                    <PageWithNavigation><LessonPage /></PageWithNavigation>
                  } />
                  
                  <Route path="/integration" element={<PageWithNavigation><Integration /></PageWithNavigation>} />
                  <Route path="/access" element={<PageWithNavigation><Access /></PageWithNavigation>} />
                  <Route path="/documents" element={<PageWithNavigation><Documents /></PageWithNavigation>} />
                  <Route path="/school" element={<PageWithNavigation><School /></PageWithNavigation>} />
                  <Route path="/community" element={<PageWithNavigation><Community /></PageWithNavigation>} />
                  <Route path="/notes" element={<PageWithNavigation><Notes /></PageWithNavigation>} />
                  <Route path="/manifesto" element={<PageWithNavigation><Manifesto /></PageWithNavigation>} />
                  <Route path="/admin" element={<PageWithNavigation><Admin /></PageWithNavigation>} />
                  <Route path="/team" element={<PageWithNavigation><Team /></PageWithNavigation>} />
                  <Route path="/team/:memberId" element={<PageWithNavigation><TeamMemberProfile /></PageWithNavigation>} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
