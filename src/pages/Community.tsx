
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Community = () => {
  const discussions = [
    { title: "Dicas para novos integrantes", replies: 24, participants: 12 },
    { title: "Melhores práticas de trabalho remoto", replies: 18, participants: 8 },
    { title: "Compartilhando conhecimento: recursos úteis", replies: 15, participants: 10 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Comunidade</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Discussões Recentes</h2>
              <Button>Nova Discussão</Button>
            </div>
            
            <div className="space-y-4">
              {discussions.map((discussion, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-lg dark:text-white">{discussion.title}</h3>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </div>
                    <div className="flex mt-3 text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{discussion.replies} respostas</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{discussion.participants} participantes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-6">Carregar mais discussões</Button>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Canais Externos</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Plataformas de Comunicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a 
                  href="https://slack.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="mr-3 bg-[#611f69] text-white p-2 rounded">
                    <span className="font-bold">S</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">Slack</p>
                    <p className="text-sm text-gray-500">Canal de comunicação rápida</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="mr-3 bg-[#5865F2] text-white p-2 rounded">
                    <span className="font-bold">D</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">Discord</p>
                    <p className="text-sm text-gray-500">Comunidade de voz e texto</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;
