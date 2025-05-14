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
import PasswordReset from "./pages/PasswordReset";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
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
import CompanyPage from "./pages/CompanyPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
              <Route path="/termos" element={<TermsOfUse />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              
              <Route element={<ProtectedRoute />}>
                {/* Redirect from onboarding to home */}
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/" element={<>
                  <MainNavigationMenu />
                  <Index />
                </>} />
                
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
                
                <Route path="/team/:memberId" element={<>
                  <MainNavigationMenu />
                  <TeamMemberProfile />
                </>} />

                {/* Add Company Page route */}
                <Route path="/company/:companyId" element={<>
                  <MainNavigationMenu />
                  <CompanyPage />
                </>} />
              
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
