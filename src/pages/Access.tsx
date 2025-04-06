
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const Access = () => {
  const tools = [
    { name: "Google Workspace", description: "Email, Drive e ferramentas colaborativas", url: "https://workspace.google.com" },
    { name: "Figma", description: "Design de interfaces e prototipagem", url: "https://figma.com" },
    { name: "Adobe Creative Cloud", description: "Suite de ferramentas de design", url: "https://adobe.com" },
    { name: "Envato", description: "Recursos de design e templates", url: "https://envato.com" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainNavigationMenu />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Acessos</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Aqui estão reunidos todos os acessos às ferramentas e sites que você vai precisar durante o trabalho.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span className="dark:text-white">{tool.name}</span>
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                    <ExternalLink size={18} />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Access;
