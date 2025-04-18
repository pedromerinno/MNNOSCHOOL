import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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

// Crie um cliente de consulta com configurações padrão
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false, // Reduzir solicitações de rede
    },
  },
});

const App = () => {
  // Registre quando o App é carregado para depuração
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<>
                  <MainNavigationMenu />
                  <Index />
                </>} />
                
                {/* Redirect /dashboard to / */}
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                
                <Route path="/courses" element={<>
                  <MainNavigationMenu />
                  <Courses />
                </>} />
                <Route path="/my-courses" element={<>
                  <MainNavigationMenu />
                  <MyCourses />
                </>} />
                <Route path="/courses/:courseId" element={<>
                  <MainNavigationMenu />
                  <CourseDetails />
                </>} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<>
                  <MainNavigationMenu />
                  <LessonPage />
                </>} />
                
                <Route path="/integration" element={<>
                  <MainNavigationMenu />
                  <Integration />
                </>} />
                <Route path="/access" element={<>
                  <MainNavigationMenu />
                  <Access />
                </>} />
                <Route path="/documents" element={<>
                  <MainNavigationMenu />
                  <Documents />
                </>} />
                <Route path="/school" element={<>
                  <MainNavigationMenu />
                  <School />
                </>} />
                <Route path="/community" element={<>
                  <MainNavigationMenu />
                  <Community />
                </>} />
                <Route path="/notes" element={<>
                  <MainNavigationMenu />
                  <Notes />
                </>} />
                <Route path="/manifesto" element={<>
                  <MainNavigationMenu />
                  <Manifesto />
                </>} />
                
                <Route 
                  path="/admin" 
                  element={<>
                    <MainNavigationMenu />
                    <Admin />
                  </>} 
                />

              <Route path="/team" element={<>
                <MainNavigationMenu />
                <Team />
              </>} />
              
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
