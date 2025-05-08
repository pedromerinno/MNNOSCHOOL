import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Trash2, Image as ImageIcon, X, Video } from "lucide-react";
import { Discussion, DiscussionReply } from '@/types/discussions';
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompanies } from "@/hooks/useCompanies";
import { Input } from "@/components/ui/input";
import { getEmbedUrl } from "@/components/integration/video-playlist/utils";

interface DiscussionViewProps {
  discussion: Discussion | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReply: (discussionId: string, content: string, imageUrl?: string, videoUrl?: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  discussion,
  isOpen,
  onOpenChange,
  onReply,
  onDeleteReply,
}) => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  const [replyContent, setReplyContent] = React.useState("");
  const [replyImageUrl, setReplyImageUrl] = React.useState<string | undefined>(undefined);
  const [replyVideoUrl, setReplyVideoUrl] = React.useState<string | undefined>(undefined);
  const [showVideoInput, setShowVideoInput] = React.useState(false);
  const [videoInputValue, setVideoInputValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmitReply = async () => {
    if (!discussion || (!replyContent.trim() && !replyImageUrl && !replyVideoUrl) || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await onReply(discussion.id, replyContent, replyImageUrl, replyVideoUrl);
      
      // Clear form fields but keep dialog open
      setReplyContent("");
      setReplyImageUrl(undefined);
      setReplyVideoUrl(undefined);
      setVideoInputValue("");
      setShowVideoInput(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoInputValue(e.target.value);
  };

  const addVideoUrl = () => {
    if (videoInputValue.trim()) {
      setReplyVideoUrl(videoInputValue);
      setShowVideoInput(false);
    }
  };

  if (!discussion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-6 pt-5 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">{discussion.title}</DialogTitle>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={discussion.profiles?.avatar || undefined} />
                <AvatarFallback style={{ backgroundColor: `${companyColor}20`, color: companyColor }}>
                  {discussion.profiles?.display_name ? discussion.profiles.display_name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-700 dark:text-gray-300">{discussion.profiles?.display_name}</span>
              <span className="mx-2">•</span>
              <span>{format(new Date(discussion.created_at), 'dd/MM/yyyy')}</span>
              {discussion.status === 'closed' && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Resolvida
                  </span>
                </>
              )}
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {discussion.image_url && (
            <div className="mb-6">
              <img 
                src={discussion.image_url} 
                alt={discussion.title} 
                className="w-full h-auto max-h-[350px] object-cover rounded-lg"
              />
            </div>
          )}

          {discussion.video_url && (
            <div className="mb-6">
              <iframe
                src={getEmbedUrl(discussion.video_url)}
                className="w-full max-h-[350px] h-72 rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          
          <div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-base">
              {discussion.content}
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Respostas ({discussion.discussion_replies.length})
            </h4>
            {discussion.discussion_replies.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Ainda não há respostas para esta discussão.</p>
                <p className="text-gray-500 text-sm mt-1">Seja o primeiro a responder!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {discussion.discussion_replies.map((reply) => (
                  <div key={reply.id} className="relative bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    {(userProfile?.is_admin || (userProfile?.id && reply.author_id === userProfile.id)) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 h-auto"
                        onClick={() => onDeleteReply(reply.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={reply.profiles?.avatar || undefined} />
                        <AvatarFallback style={{ backgroundColor: `${companyColor}20`, color: companyColor }}>
                          {reply.profiles?.display_name ? reply.profiles.display_name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {reply.profiles?.display_name}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{format(new Date(reply.created_at), 'dd/MM/yyyy')}</span>
                    </div>
                    {reply.image_url && (
                      <div className="mb-4">
                        <img 
                          src={reply.image_url} 
                          alt="Reply image" 
                          className="w-full h-auto max-h-[280px] object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {reply.video_url && (
                      <div className="mb-4">
                        <iframe
                          src={getEmbedUrl(reply.video_url)}
                          className="w-full h-60 max-h-[280px] rounded-lg"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                    {reply.content && (
                      <p className="text-gray-700 dark:text-gray-300 pr-6">{reply.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t p-4">
          {replyImageUrl && (
            <div className="mb-4 relative">
              <img 
                src={replyImageUrl} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setReplyImageUrl(undefined)}
              >
                Remover
              </Button>
            </div>
          )}

          {replyVideoUrl && (
            <div className="mb-4 relative">
              <iframe
                src={getEmbedUrl(replyVideoUrl)}
                className="w-full h-48 rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setReplyVideoUrl(undefined)}
              >
                Remover
              </Button>
            </div>
          )}

          {showVideoInput && (
            <div className="flex gap-2 mb-4">
              <Input
                value={videoInputValue}
                onChange={handleVideoUrlChange}
                placeholder="Cole a URL do vídeo (YouTube, Vimeo ou Loom)"
                className="flex-1"
              />
              <Button type="button" onClick={addVideoUrl}>
                Adicionar
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowVideoInput(false)}>
                Cancelar
              </Button>
            </div>
          )}

          <Textarea 
            placeholder="Escreva sua resposta..." 
            rows={3}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="resize-none"
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-4">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="hidden" 
                id="image-upload"
              />
              <label 
                htmlFor="image-upload" 
                className="cursor-pointer flex items-center text-gray-500 hover:text-gray-700"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                Adicionar imagem
              </label>

              {!replyVideoUrl && !showVideoInput && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex items-center text-gray-500 hover:text-gray-700 p-0"
                  onClick={() => setShowVideoInput(true)}
                >
                  <Video className="h-5 w-5 mr-2" />
                  Adicionar vídeo
                </Button>
              )}
            </div>

            <Button 
              onClick={handleSubmitReply} 
              className="rounded-full px-5"
              style={{ backgroundColor: companyColor }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Responder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
