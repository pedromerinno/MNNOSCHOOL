
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
import UserOnboarding from "./pages/UserOnboarding";
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

const queryClient = new QueryClient();

// Criar componente separado para rotas protegidas com a navegação
const ProtectedRouteWithNav = ({ children }) => (
  <>
    <MainNavigationMenu />
    {children}
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<UserOnboarding />} />
            
            <Route element={<ProtectedRoute />}>
              <Route 
                path="/" 
                element={
                  <ProtectedRouteWithNav>
                    <Index />
                  </ProtectedRouteWithNav>
                } 
              />
              
              {/* Redirect /dashboard to / */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              
              <Route 
                path="/courses" 
                element={
                  <ProtectedRouteWithNav>
                    <Courses />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/my-courses" 
                element={
                  <ProtectedRouteWithNav>
                    <MyCourses />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/courses/:courseId" 
                element={
                  <ProtectedRouteWithNav>
                    <CourseDetails />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/courses/:courseId/lessons/:lessonId" 
                element={
                  <ProtectedRouteWithNav>
                    <LessonPage />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/integration" 
                element={
                  <ProtectedRouteWithNav>
                    <Integration />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/access" 
                element={
                  <ProtectedRouteWithNav>
                    <Access />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/documents" 
                element={
                  <ProtectedRouteWithNav>
                    <Documents />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/school" 
                element={
                  <ProtectedRouteWithNav>
                    <School />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/community" 
                element={
                  <ProtectedRouteWithNav>
                    <Community />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/notes" 
                element={
                  <ProtectedRouteWithNav>
                    <Notes />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/manifesto" 
                element={
                  <ProtectedRouteWithNav>
                    <Manifesto />
                  </ProtectedRouteWithNav>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRouteWithNav>
                    <Admin />
                  </ProtectedRouteWithNav>
                } 
              />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
