
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompaniesProvider } from "@/hooks/useCompanies.tsx";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { CompanyRequiredWrapper } from "@/components/auth/CompanyRequiredWrapper";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Courses from "./pages/Courses";
import Documents from "./pages/Documents";
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
                  
                  {/* Rotas protegidas - com verificação de empresa */}
                  <Route path="/*" element={
                    <CompanyRequiredWrapper>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
                        <Route path="/documents" element={<Documents />} />
                      </Routes>
                    </CompanyRequiredWrapper>
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
