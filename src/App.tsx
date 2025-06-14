
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompaniesProvider } from "@/hooks/useCompanies";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { CompanyRequiredCheck } from "@/components/auth/CompanyRequiredCheck";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Courses from "./pages/Courses";
import Documents from "./pages/Documents";
import Discussions from "./pages/Discussions";
import Access from "./pages/Access";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LessonPage from "./pages/LessonPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CompaniesProvider>
              <OnboardingProvider>
                <Routes>
                  {/* Rotas públicas - sem verificação de empresa */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  
                  {/* Rotas protegidas - com verificação de empresa */}
                  <Route path="/*" element={
                    <CompanyRequiredCheck>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/discussions" element={<Discussions />} />
                        <Route path="/access" element={<Access />} />
                        <Route path="/feedback" element={<Feedback />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </CompanyRequiredCheck>
                  } />
                </Routes>
              </OnboardingProvider>
            </CompaniesProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
