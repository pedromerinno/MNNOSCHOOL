
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { useLegacyEventsCompat } from "@/hooks/compat/useLegacyEvents";
import { Toaster as SonnerToaster } from "sonner";

function App() {
  // Ativar compatibilidade com eventos legados
  useLegacyEventsCompat();

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <AppRoutes />
          <Toaster />
          <SonnerToaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
