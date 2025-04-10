
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, ExternalLink, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Mock data for discussions - in a real app, this would come from Supabase
const mockDiscussions = [
  { 
    id: "1", 
    title: "Dicas para novos integrantes", 
    content: "Compartilhe aqui suas melhores dicas para quem está começando na empresa.",
    author: "João Silva",
    createdAt: "2023-08-15T10:30:00",
    replies: 24, 
    participants: 12 
  },
  { 
    id: "2", 
    title: "Melhores práticas de trabalho remoto", 
    content: "Como vocês têm organizado a rotina de trabalho remoto? Quais ferramentas utilizam?",
    author: "Maria Santos",
    createdAt: "2023-08-10T14:20:00",
    replies: 18, 
    participants: 8 
  },
  { 
    id: "3", 
    title: "Compartilhando conhecimento: recursos úteis", 
    content: "Neste tópico podemos compartilhar links, livros e cursos que nos ajudaram no desenvolvimento profissional.",
    author: "Carlos Oliveira",
    createdAt: "2023-08-05T09:15:00",
    replies: 15, 
    participants: 10 
  },
];

const Community = () => {
  const { user, userProfile } = useAuth();
  const [discussions, setDiscussions] = useState(mockDiscussions);
  const [searchQuery, setSearchQuery] = useState("");
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<null | {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    replies: number;
    participants: number;
  }>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleCreateDiscussion = () => {
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // In a real app, this would save to Supabase
    const newDiscussion = {
      id: Date.now().toString(),
      title: newDiscussionTitle,
      content: newDiscussionContent,
      author: userProfile?.displayName || user?.email?.split("@")[0] || "Usuário",
      createdAt: new Date().toISOString(),
      replies: 0,
      participants: 1
    };

    setDiscussions([newDiscussion, ...discussions]);
    setNewDiscussionTitle("");
    setNewDiscussionContent("");
    setIsDialogOpen(false);
    toast.success("Discussão criada com sucesso!");
  };

  const handleViewDiscussion = (discussion: {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    replies: number;
    participants: number;
  }) => {
    setSelectedDiscussion(discussion);
    setViewDialogOpen(true);
  };

  const filteredDiscussions = discussions.filter(
    discussion => discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Comunidade</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div className="relative w-full md:w-auto md:flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Buscar discussões..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Discussão
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Criar nova discussão</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">Título da discussão</label>
                      <Input
                        id="title"
                        value={newDiscussionTitle}
                        onChange={(e) => setNewDiscussionTitle(e.target.value)}
                        placeholder="Ex: Dicas para novos integrantes"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="content" className="text-sm font-medium">Conteúdo</label>
                      <Textarea
                        id="content"
                        value={newDiscussionContent}
                        onChange={(e) => setNewDiscussionContent(e.target.value)}
                        placeholder="Descreva sua discussão com detalhes..."
                        rows={5}
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleCreateDiscussion}>Criar discussão</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {filteredDiscussions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma discussão encontrada</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md">
                  {searchQuery 
                    ? "Tente uma busca diferente ou crie uma nova discussão."
                    : "Seja o primeiro a iniciar uma conversa na comunidade!"}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Discussão
                    </Button>
                  </DialogTrigger>
                  <DialogContent>{/* Content will be same as above */}</DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDiscussions.map((discussion) => (
                  <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-lg dark:text-white">{discussion.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDiscussion(discussion)}
                        >
                          Ver
                        </Button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                        {discussion.content}
                      </p>
                      <div className="flex items-center mt-3 text-xs text-gray-500">
                        <span className="mr-2">por {discussion.author}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
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
            )}
            
            {filteredDiscussions.length > 0 && (
              <Button variant="outline" className="w-full mt-6">Carregar mais discussões</Button>
            )}
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
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Guia da Comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    <span>Seja respeitoso com todos os membros</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    <span>Mantenha as discussões relevantes ao tema</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    <span>Compartilhe conhecimento e ajude os outros</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                    <span>Não compartilhe informações confidenciais</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* View Discussion Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedDiscussion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedDiscussion.title}</DialogTitle>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <span className="mr-2">por {selectedDiscussion.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selectedDiscussion.content}
                </p>
              </div>
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">Respostas ({selectedDiscussion.replies})</h4>
                {selectedDiscussion.replies === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Ainda não há respostas para esta discussão.</p>
                    <p className="text-gray-500 text-sm mt-1">Seja o primeiro a responder!</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">Respostas serão implementadas em breve.</p>
                )}
              </div>
              <div className="mt-4">
                <Textarea 
                  placeholder="Escreva sua resposta..." 
                  className="w-full"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button>Responder</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
