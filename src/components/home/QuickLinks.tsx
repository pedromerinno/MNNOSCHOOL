
import { Card, CardContent } from "@/components/ui/card";
import { Link, FileText, Users, School, Globe, Settings } from "lucide-react";

export const QuickLinks = () => {
  const links = [
    { icon: Link, label: "Integração" },
    { icon: Settings, label: "Acessos" },
    { icon: FileText, label: "Documentos" },
    { icon: School, label: "Escola", hasDropdown: true },
    { icon: Globe, label: "Comunidade", hasDropdown: true }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
      {links.map((link, index) => (
        <Card key={index} className="border-0 shadow-none bg-white rounded-[30px]">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 bg-gray-100 p-2 rounded-lg">
                <link.icon className="h-5 w-5 text-gray-700 stroke-current" strokeWidth={1.5} />
              </span>
              <span className="font-medium">{link.label}</span>
            </div>
            {link.hasDropdown && (
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
              </svg>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
