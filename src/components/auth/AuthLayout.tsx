
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [backgroundMedia, setBackgroundMedia] = useState<{
    url: string;
    type: 'video' | 'image';
  }>({
    url: "",
    type: 'video'
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBackgroundMedia = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching background media...");
        const { data, error } = await supabase
          .from('settings')
          .select('value, media_type')
          .eq('key', 'login_background')
          .maybeSingle();

        console.log("Background data fetched:", { data, error });

        if (!error && data?.value) {
          setBackgroundMedia({
            url: data.value,
            type: (data.media_type as 'video' | 'image') || 'video'
          });
          console.log("Set background to:", data.value, data.media_type);
        } else {
          console.error("Error fetching background media:", error);
          setBackgroundMedia({
            url: "",
            type: 'image'
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching background media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackgroundMedia();

    const handleBackgroundUpdate = () => {
      console.log("Background update event received");
      fetchBackgroundMedia();
    };
    
    window.addEventListener('background-updated', handleBackgroundUpdate);

    return () => {
      window.removeEventListener('background-updated', handleBackgroundUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full max-w-2xl mx-auto px-16 py-12 flex items-center justify-center bg-white">
        {children}
      </div>
      
      {/* Right side - Background Media */}
      <div className="flex-1 relative overflow-hidden hidden lg:block">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-merinno-dark"></div>
          </div>
        ) : backgroundMedia.url ? (
          <>
            {backgroundMedia.type === 'video' ? (
              <video 
                key={backgroundMedia.url}
                autoPlay 
                muted 
                loop 
                playsInline
                className="absolute w-full h-full object-cover"
              >
                <source src={backgroundMedia.url} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            ) : (
              <img 
                src={backgroundMedia.url} 
                alt="Login Background" 
                className="absolute w-full h-full object-cover"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-merinno-dark to-black flex items-center justify-center">
            <div className="text-white/70 text-center px-4">
              <p className="text-lg font-medium">Customize o background</p>
              <p className="text-sm mt-2">Configure uma imagem ou vídeo no painel administrativo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
