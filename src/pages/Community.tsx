
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useDiscussions } from "@/hooks/useDiscussions";
import { Discussion as DiscussionType } from "@/types/discussions";
import { Discussion } from "@/components/community/Discussion";
import { DiscussionForm } from "@/components/community/DiscussionForm";
import { DiscussionView } from "@/components/community/DiscussionView";
import { useCompanies } from "@/hooks/useCompanies";
import { CommunityLayout } from "@/components/community/layout/CommunityLayout";

const Community = () => {
  const { selectedCompany } = useCompanies();
  const { discussions, isLoading, createDiscussion, deleteDiscussion, addReply, deleteReply } = useDiscussions();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionType | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleCreateDiscussion = async (title: string, content: string, imageUrl?: string) => {
    await createDiscussion(title, content, imageUrl);
  };

  const handleViewDiscussion = (discussion: DiscussionType) => {
    setSelectedDiscussion(discussion);
    setViewDialogOpen(true);
  };

  const filteredDiscussions = discussions.filter(
    discussion => discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedCompany) {
    return (
      <CommunityLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium mb-2">Selecione uma empresa para visualizar as discussões</h3>
          <p className="text-sm text-gray-500">
            Você precisa selecionar uma empresa para participar das discussões.
          </p>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <div className="max-w-5xl mx-auto">
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Discussão
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Nenhuma discussão encontrada</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery 
                ? "Tente uma busca diferente ou crie uma nova discussão."
                : "Seja o primeiro a iniciar uma conversa na comunidade!"}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Discussão
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDiscussions.map((discussion) => (
              <Discussion
                key={discussion.id}
                discussion={discussion}
                onView={handleViewDiscussion}
                onDelete={deleteDiscussion}
              />
            ))}
          </div>
        )}
      </div>

      <DiscussionForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateDiscussion}
      />

      <DiscussionView
        discussion={selectedDiscussion}
        isOpen={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onReply={addReply}
        onDeleteReply={deleteReply}
      />
    </CommunityLayout>
  );
};

export default Community;
