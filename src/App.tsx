import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import NotFound from "./pages/NotFound";
import Integration from "./pages/Integration";
import Access from "./pages/Access";
import Documents from "./pages/Documents";
import School from "./pages/School";
import Community from "./pages/Community";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
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
              <Route path="/dashboard" element={<>
                <MainNavigationMenu />
                <Dashboard />
              </>} />
              <Route path="/courses" element={<>
                <MainNavigationMenu />
                <Courses />
              </>} />
              <Route path="/courses/:courseId" element={<>
                <MainNavigationMenu />
                <CourseDetails />
              </>} />
              
              <Route path="/integration" element={<Integration />} />
              <Route path="/access" element={<Access />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/school" element={<School />} />
              <Route path="/community" element={<Community />} />
              
              <Route 
                path="/admin" 
                element={<>
                  <MainNavigationMenu />
                  <Admin />
                </>} 
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
