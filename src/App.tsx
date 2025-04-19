import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { PageLayout } from "@/components/layout/PageLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false, // Reduzir solicitações de rede
    },
  },
});

const App = () => {
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
                  <PageLayout title="Dashboard">
                    <Index />
                  </PageLayout>
                </>} />
                
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                
                <Route path="/courses" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Cursos">
                    <Courses />
                  </PageLayout>
                </>} />

                <Route path="/my-courses" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Meus Cursos">
                    <MyCourses />
                  </PageLayout>
                </>} />

                <Route path="/courses/:courseId" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Detalhes do Curso">
                    <CourseDetails />
                  </PageLayout>
                </>} />

                <Route path="/courses/:courseId/lessons/:lessonId" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Aula">
                    <LessonPage />
                  </PageLayout>
                </>} />
                
                <Route path="/integration" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Integração">
                    <Integration />
                  </PageLayout>
                </>} />

                <Route path="/access" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Acessos">
                    <Access />
                  </PageLayout>
                </>} />

                <Route path="/documents" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Documentos">
                    <Documents />
                  </PageLayout>
                </>} />

                <Route path="/school" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Escola">
                    <School />
                  </PageLayout>
                </>} />

                <Route path="/community" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Comunidade">
                    <Community />
                  </PageLayout>
                </>} />

                <Route path="/notes" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Anotações">
                    <Notes />
                  </PageLayout>
                </>} />

                <Route path="/manifesto" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Manifesto">
                    <Manifesto />
                  </PageLayout>
                </>} />
                
                <Route path="/admin" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Administração">
                    <Admin />
                  </PageLayout>
                </>} />

                <Route path="/team" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Equipe">
                    <Team />
                  </PageLayout>
                </>} />
                
                <Route path="/team/:memberId" element={<>
                  <MainNavigationMenu />
                  <PageLayout title="Perfil do Membro">
                    <TeamMemberProfile />
                  </PageLayout>
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
