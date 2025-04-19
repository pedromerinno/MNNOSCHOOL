import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { PageLayout } from "@/components/layout/PageLayout";

// Mock data for discussions - in a real app, this would come from Supabase
const mockDiscussions = [
  { 
    id: "1", 
    title: "Dicas para novos integrantes", 
    content: "Compartilhe aqui suas melhores dicas para quem está começando na empresa.",
    author: "João Silva",
    createdAt: "2023-08-15T10:30:00",
    replies: 24, 
    participants: 12,
    replyList: [
      {
        id: "r1",
        author: "Maria Santos",
        content: "Recomendo sempre perguntar quando tiver dúvidas. A equipe é muito acolhedora!",
        createdAt: "2023-08-16T09:30:00"
      },
      {
        id: "r2",
        author: "Carlos Oliveira",
        content: "Participar das reuniões de equipe desde o início ajuda muito a entender o contexto dos projetos.",
        createdAt: "2023-08-17T14:20:00"
      }
    ]
  },
  { 
    id: "2", 
    title: "Melhores práticas de trabalho remoto", 
    content: "Como vocês têm organizado a rotina de trabalho remoto? Quais ferramentas utilizam?",
    author: "Maria Santos",
    createdAt: "2023-08-10T14:20:00",
    replies: 18, 
    participants: 8,
    replyList: [
      {
        id: "r3",
        author: "Paulo Silva",
        content: "Utilizo o Notion para organizar minhas tarefas diárias e o Toggl para controlar meu tempo.",
        createdAt: "2023-08-11T10:15:00"
      }
    ]
  },
  { 
    id: "3", 
    title: "Compartilhando conhecimento: recursos úteis", 
    content: "Neste tópico podemos compartilhar links, livros e cursos que nos ajudaram no desenvolvimento profissional.",
    author: "Carlos Oliveira",
    createdAt: "2023-08-05T09:15:00",
    replies: 15, 
    participants: 10,
    replyList: []
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
    replyList: Array<{
      id: string;
      author: string;
      content: string;
      createdAt: string;
    }>;
  }>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [newReplyContent, setNewReplyContent] = useState("");

  // Verificar se o usuário é um administrador
  const isAdmin = userProfile?.isAdmin === true;

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
      participants: 1,
      replyList: []
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
    replyList: Array<{
      id: string;
      author: string;
      content: string;
      createdAt: string;
    }>;
  }) => {
    setSelectedDiscussion(discussion);
    setViewDialogOpen(true);
  };

  const handleSubmitReply = () => {
    if (!newReplyContent.trim() || !selectedDiscussion) {
      toast.error("Por favor, escreva uma resposta válida");
      return;
    }

    const newReply = {
      id: `r${Date.now()}`,
      content: newReplyContent,
      author: userProfile?.displayName || user?.email?.split("@")[0] || "Usuário",
      createdAt: new Date().toISOString()
    };

    // Update selected discussion
    const updatedSelectedDiscussion = {
      ...selectedDiscussion,
      replies: selectedDiscussion.replies + 1,
      participants: selectedDiscussion.replyList.some(reply => reply.author === newReply.author) 
        ? selectedDiscussion.participants 
        : selectedDiscussion.participants + 1,
      replyList: [...selectedDiscussion.replyList, newReply]
    };
    
    setSelectedDiscussion(updatedSelectedDiscussion);

    // Update discussions list
    const updatedDiscussions = discussions.map(disc => 
      disc.id === selectedDiscussion.id 
        ? updatedSelectedDiscussion 
        : disc
    );
    
    setDiscussions(updatedDiscussions);
    setNewReplyContent("");
    toast.success("Resposta enviada com sucesso!");
  };

  // Nova função para excluir uma discussão
  const handleDeleteDiscussion = (discussionId: string) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem excluir discussões");
      return;
    }

    const updatedDiscussions = discussions.filter(disc => disc.id !== discussionId);
    setDiscussions(updatedDiscussions);
    
    // Se a discussão a ser excluída está sendo visualizada, fechamos o diálogo
    if (selectedDiscussion?.id === discussionId) {
      setViewDialogOpen(false);
      setSelectedDiscussion(null);
    }
    
    toast.success("Discussão excluída com sucesso!");
  };

  // Nova função para excluir uma resposta
  const handleDeleteReply = (discussionId: string, replyId: string) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem excluir respostas");
      return;
    }

    // Atualize a discussão selecionada se estiver visualizando-a
    if (selectedDiscussion?.id === discussionId) {
      const updatedReplyList = selectedDiscussion.replyList.filter(reply => reply.id !== replyId);
      
      const updatedSelectedDiscussion = {
        ...selectedDiscussion,
        replies: updatedReplyList.length,
        replyList: updatedReplyList
      };
      
      setSelectedDiscussion(updatedSelectedDiscussion);
    }
    
    // Atualize a lista de discussões
    const updatedDiscussions = discussions.map(disc => {
      if (disc.id === discussionId) {
        const updatedReplyList = disc.replyList.filter(reply => reply.id !== replyId);
        return {
          ...disc,
          replies: updatedReplyList.length,
          replyList: updatedReplyList
        };
      }
      return disc;
    });
    
    setDiscussions(updatedDiscussions);
    toast.success("Resposta excluída com sucesso!");
  };

  const filteredDiscussions = discussions.filter(
    discussion => discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout title="Comunidade">
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
                <ContextMenu key={discussion.id}>
                  <ContextMenuTrigger>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-lg dark:text-white">{discussion.title}</h3>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDiscussion(discussion.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDiscussion(discussion)}
                            >
                              Ver
                            </Button>
                          </div>
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
                        </CardContent>
                      </Card>
                    </ContextMenuTrigger>
                    {isAdmin && (
                      <ContextMenuContent>
                        <ContextMenuItem 
                          className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
                          onClick={() => handleDeleteDiscussion(discussion.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir discussão
                        </ContextMenuItem>
                      </ContextMenuContent>
                    )}
                  </ContextMenu>
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
                  {selectedDiscussion.replyList.length === 0 ? (
                    <div className="text-center py-6">
                      <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Ainda não há respostas para esta discussão.</p>
                      <p className="text-gray-500 text-sm mt-1">Seja o primeiro a responder!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDiscussion.replyList.map((reply) => (
                        <div key={reply.id} className="relative bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 h-auto"
                              onClick={() => handleDeleteReply(selectedDiscussion.id, reply.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{reply.author}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 pr-6">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Textarea 
                    placeholder="Escreva sua resposta..." 
                    className="w-full"
                    rows={3}
                    value={newReplyContent}
                    onChange={(e) => setNewReplyContent(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button onClick={handleSubmitReply}>Responder</Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Community;
