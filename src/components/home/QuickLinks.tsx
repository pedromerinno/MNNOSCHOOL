
import { Card, CardContent } from "@/components/ui/card";
import { Link, FileText, Users, School, Globe, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickLinks = () => {
  const navigate = useNavigate();
  
  const links = [
    { icon: Link, label: "Integração", path: "/integration" },
    { icon: Settings, label: "Acessos", path: "/access" },
    { icon: FileText, label: "Documentos", path: "/documents" },
    { icon: School, label: "Escola", path: "/school", hasDropdown: true },
    { icon: Globe, label: "Comunidade", path: "/community", hasDropdown: true }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
      {links.map((link, index) => (
        <Card 
          key={index} 
          className="border-0 shadow-none bg-white dark:bg-card rounded-[30px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => handleNavigate(link.path)}
        >
          <CardContent className="p-8 flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <link.icon className="h-5 w-5 text-gray-700 dark:text-gray-300 stroke-current" strokeWidth={1.5} />
              </span>
              <span className="font-medium dark:text-white">{link.label}</span>
            </div>
            {link.hasDropdown && (
              <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
              </svg>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
