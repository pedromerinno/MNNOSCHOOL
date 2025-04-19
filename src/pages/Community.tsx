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
import { cn } from "@/lib/utils";

type FilterStatus = 'all' | 'open' | 'closed';

const Community = () => {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  const getLighterCompanyColor = (color: string, opacity: number = 0.1) => {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else if (max === b) h = (r - g) / d + 4;
      
      h /= 6;
    }

    l = Math.min(1, l * 1.5);

    const hsl2rgb = (h: number, s: number, l: number) => {
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
      ];
    };

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const [r255, g255, b255] = hsl2rgb(h, s, l);
    return `rgba(${r255}, ${g255}, ${b255}, ${opacity})`;
  };

  const { discussions, isLoading, createDiscussion, deleteDiscussion, addReply, deleteReply, toggleDiscussionStatus } = useDiscussions();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
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
    discussion => 
      (discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       discussion.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || discussion.status === statusFilter)
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
      <div className="">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            <div 
              className="flex gap-2 p-1.5 rounded-2xl order-2 md:order-1 w-full md:w-auto" 
              style={{ 
                backgroundColor: getLighterCompanyColor(companyColor, 0.1),
                borderColor: companyColor
              }}
            >
              <Button 
                variant={statusFilter === 'all' ? "default" : "ghost"}
                className={cn(
                  "rounded-xl py-4 px-6 transition-colors",
                  statusFilter === 'all' ? `bg-background` : ''
                )}
                style={{
                  backgroundColor: statusFilter === 'all' ? getLighterCompanyColor(companyColor, 0.2) : undefined,
                  borderColor: statusFilter === 'all' ? companyColor : undefined,
                  color: statusFilter === 'all' ? companyColor : undefined
                }}
                onClick={() => setStatusFilter('all')}
              >
                Todas
              </Button>
              <Button 
                variant={statusFilter === 'open' ? "default" : "ghost"}
                className={cn(
                  "rounded-xl py-4 px-6 transition-colors",
                  statusFilter === 'open' ? `bg-background` : ''
                )}
                style={{
                  backgroundColor: statusFilter === 'open' ? getLighterCompanyColor(companyColor, 0.2) : undefined,
                  borderColor: statusFilter === 'open' ? companyColor : undefined,
                  color: statusFilter === 'open' ? companyColor : undefined
                }}
                onClick={() => setStatusFilter('open')}
              >
                Abertas
              </Button>
              <Button 
                variant={statusFilter === 'closed' ? "default" : "ghost"}
                className={cn(
                  "rounded-xl py-4 px-6 transition-colors",
                  statusFilter === 'closed' ? `bg-background` : ''
                )}
                style={{
                  backgroundColor: statusFilter === 'closed' ? getLighterCompanyColor(companyColor, 0.2) : undefined,
                  borderColor: statusFilter === 'closed' ? companyColor : undefined,
                  color: statusFilter === 'closed' ? companyColor : undefined
                }}
                onClick={() => setStatusFilter('closed')}
              >
                Concluídas
              </Button>
            </div>

            <div className="flex gap-4 items-center order-1 md:order-2 w-full md:w-auto">
              <div className="relative flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar discussões..."
                    className="pl-10 w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="rounded-full h-11 px-6 gap-2 bg-primary hover:bg-primary/90 whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Nova Discussão
              </Button>
            </div>
          </div>
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
            {filteredDiscussions.map((discussion, index) => (
              <Discussion
                key={discussion.id}
                discussion={discussion}
                onView={handleViewDiscussion}
                onDelete={deleteDiscussion}
                onToggleStatus={toggleDiscussionStatus}
                index={index}
                totalCount={filteredDiscussions.length}
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
