
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Trash2, Image as ImageIcon, X, Video } from "lucide-react";
import { Discussion, DiscussionReply } from "@/types/discussions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompanies } from "@/hooks/useCompanies";
import { Input } from "@/components/ui/input";

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
  const [videoError, setVideoError] = React.useState<string | null>(null);

  const handleSubmitReply = async () => {
    if (!discussion || (!replyContent.trim() && !replyImageUrl && !replyVideoUrl)) return;
    if (replyVideoUrl && videoError) return;
    
    await onReply(discussion.id, replyContent, replyImageUrl, replyVideoUrl);
    setReplyContent("");
    setReplyImageUrl(undefined);
    setReplyVideoUrl(undefined);
    setVideoError(null);
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

  const validateVideoUrl = (url: string): boolean => {
    // Check if URL is from YouTube, Vimeo, or Loom
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com\/|player\.vimeo\.com\/video\/)[0-9]+/;
    const loomRegex = /^(https?:\/\/)?(www\.)?(loom\.com\/share\/)[a-zA-Z0-9]+/;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url) || loomRegex.test(url);
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setReplyVideoUrl(url);
    
    if (url && !validateVideoUrl(url)) {
      setVideoError("URL inválida. Por favor, insira um link do YouTube, Vimeo ou Loom.");
    } else {
      setVideoError(null);
    }
  };

  // Function to convert video URL to embed URL
  const getEmbedUrl = (url: string): string => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Loom
    const loomRegex = /loom\.com\/share\/([a-zA-Z0-9]+)/;
    const loomMatch = url.match(loomRegex);
    if (loomMatch) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }
    
    return url;
  };

  if (!discussion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-xl">
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
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {discussion.image_url && (
            <div className="mb-6">
              <img 
                src={discussion.image_url} 
                alt={discussion.title} 
                className="w-full h-auto max-h-[400px] object-cover rounded-lg"
              />
            </div>
          )}
          
          {discussion.video_url && (
            <div className="mb-6">
              <div className="relative pt-[56.25%] w-full">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={getEmbedUrl(discussion.video_url)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Embedded video"
                ></iframe>
              </div>
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
                          className="w-full h-auto max-h-[300px] object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    {reply.video_url && (
                      <div className="mb-4">
                        <div className="relative pt-[56.25%] w-full">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            src={getEmbedUrl(reply.video_url)}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Embedded video"
                          ></iframe>
                        </div>
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
          
          {replyVideoUrl && !videoError && (
            <div className="mb-4">
              <div className="relative pt-[56.25%] w-full">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={getEmbedUrl(replyVideoUrl)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video preview"
                ></iframe>
              </div>
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
              
              <div className="flex flex-col">
                <div className="cursor-pointer flex items-center text-gray-500 hover:text-gray-700">
                  <Video className="h-5 w-5 mr-2" />
                  <Input 
                    placeholder="URL do vídeo"
                    className="h-7 px-2 w-[200px]"
                    value={replyVideoUrl || ''}
                    onChange={handleVideoUrlChange}
                  />
                </div>
                {videoError && (
                  <p className="text-xs text-red-500 mt-1 ml-7">{videoError}</p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleSubmitReply} 
              className="rounded-full px-5"
              style={{ backgroundColor: companyColor }}
              disabled={replyVideoUrl ? videoError !== null : false}
            >
              Responder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
