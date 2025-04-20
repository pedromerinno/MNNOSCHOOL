
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyCache } from "@/hooks/company/useCompanyCache";

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { selectedCompany } = useCompanies();
  const { getInitialSelectedCompany } = useCompanyCache();
  
  // Estado local para cor com inicialização imediata do cache
  const [accentColor, setAccentColor] = useState<string>(() => {
    try {
      // Tentar obter a cor diretamente do cache para renderização inicial
      const cachedCompany = getInitialSelectedCompany();
      return cachedCompany?.cor_principal || "#1EAEDB";
    } catch (e) {
      return "#1EAEDB"; // Cor padrão azul
    }
  });
  
  // Atualizar a cor quando selectedCompany mudar
  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      setAccentColor(selectedCompany.cor_principal);
    }
  }, [selectedCompany]);

  // Check for user preference on component mount
  useEffect(() => {
    // Check if user previously set dark mode
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      // Switch to light mode
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // Switch to dark mode
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="text-gray-500 dark:text-gray-300 hover:text-current dark:hover:text-current transition-colors"
      style={{ "--hover-color": accentColor } as React.CSSProperties}
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
