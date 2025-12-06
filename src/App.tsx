
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { FocusProvider } from "@/contexts/FocusContext";
import { FocusPopup } from "@/components/focus/FocusPopup";
import { CompanyRequiredWrapper } from "@/components/auth/CompanyRequiredWrapper";
import { PagePreloader } from "@/components/ui/PagePreloader";

// Lazy load all pages for better code splitting and faster initial load
const Index = lazy(() => import("./pages/Index"));
const Admin = lazy(() => import("./pages/Admin"));
const SuperAdmin = lazy(() => import("./pages/SuperAdmin"));
const Courses = lazy(() => import("./pages/Courses"));
const MyCourses = lazy(() => import("./pages/MyCourses"));
const Sugeridos = lazy(() => import("./pages/Sugeridos"));
const Favoritos = lazy(() => import("./pages/Favoritos"));
const Performance = lazy(() => import("./pages/Performance"));
const Professores = lazy(() => import("./pages/Professores"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const Documents = lazy(() => import("./pages/Documents"));
const Community = lazy(() => import("./pages/Community"));
const Team = lazy(() => import("./pages/Team"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const Integration = lazy(() => import("./pages/Integration"));
const Access = lazy(() => import("./pages/Access"));
const AIChat = lazy(() => import("./pages/AIChat"));
const ComponentPlaygroundDemo = lazy(() => import("./pages/ComponentPlaygroundDemo"));
const SpotifyCallback = lazy(() => import("./pages/SpotifyCallback"));

// Optimized QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      retry: 1, // Only retry once on failure
      retryDelay: 1000, // Wait 1 second before retry
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Loading fallback component wrapper que verifica a rota
const PageLoadingFallbackWrapper = () => {
  const location = useLocation();
  // Na rota "/", não mostrar nada - IndexContent já cuida do loading
  if (location.pathname === "/") {
    return null;
  }
  return <PagePreloader />;
};

// Loading fallback component - não mostra nada na rota "/" para evitar spinner duplo
const PageLoadingFallback = () => {
  // Usar window.location como fallback se useLocation não estiver disponível
  if (typeof window !== "undefined" && window.location.pathname === "/") {
    return null;
  }
  return <PagePreloader />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <FocusProvider>
                <Suspense fallback={<PageLoadingFallbackWrapper />}>
                  <Routes>
                  {/* Rotas públicas - sem verificação de empresa */}
                  <Route 
                    path="/login" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Login />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/signup" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Signup />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/spotify/callback" 
                    element={
                      <Suspense fallback={<PageLoadingFallback />}>
                        <SpotifyCallback />
                      </Suspense>
                    } 
                  />
                  
                  {/* Rotas protegidas - com verificação de empresa */}
                  <Route path="/*" element={
                    <CompanyRequiredWrapper>
                      <Suspense fallback={<PageLoadingFallbackWrapper />}>
                        <Routes>
                          <Route path="/" element={
                            <Suspense fallback={null}>
                              <Index />
                            </Suspense>
                          } />
                          <Route path="/admin" element={<Admin />} />
                          <Route path="/super-admin" element={<SuperAdmin />} />
                          <Route path="/courses" element={<Courses />} />
                          <Route path="/my-courses" element={<MyCourses />} />
                          <Route path="/sugeridos" element={<Sugeridos />} />
                          <Route path="/favoritos" element={<Favoritos />} />
                          <Route path="/performance" element={<Performance />} />
                          <Route path="/professores" element={<Professores />} />
                          <Route path="/courses/:courseId" element={<CourseDetails />} />
                          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
                          <Route path="/documents" element={<Documents />} />
                          <Route path="/community" element={<Community />} />
                          <Route path="/team" element={<Team />} />
                          <Route path="/integration" element={<Integration />} />
                          <Route path="/access" element={<Access />} />
                          <Route path="/ai-chat" element={<AIChat />} />
                          <Route path="/component-playground" element={<ComponentPlaygroundDemo />} />
                        </Routes>
                      </Suspense>
                    </CompanyRequiredWrapper>
                  } />
                  </Routes>
                </Suspense>
                <FocusPopup />
              </FocusProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
