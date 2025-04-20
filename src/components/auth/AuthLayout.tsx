
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

  useEffect(() => {
    const fetchBackgroundMedia = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value, media_type')
          .eq('key', 'login_background')
          .single();

        if (!error && data?.value) {
          setBackgroundMedia({
            url: data.value,
            type: (data.media_type as 'video' | 'image') || 'video'
          });
        }
      } catch (error) {
        console.error('Error fetching background media:', error);
      }
    };

    fetchBackgroundMedia();

    // Listen for updates from other components
    const handleBackgroundUpdate = () => {
      fetchBackgroundMedia();
    };
    
    window.addEventListener('background-updated', handleBackgroundUpdate);

    return () => {
      window.removeEventListener('background-updated', handleBackgroundUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 bg-merinno-light p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-merinno-dark">MERINNO</h1>
          </div>
          {children}
        </div>
      </div>
      
      {/* Right side - Background Media */}
      <div className="w-full md:w-1/2 bg-merinno-blue relative overflow-hidden hidden md:block">
        {backgroundMedia.url && (
          backgroundMedia.type === 'video' ? (
            <video 
              autoPlay 
              muted 
              loop 
              className="absolute w-full h-full object-cover"
            >
              <source src={backgroundMedia.url} type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          ) : (
            <img 
              src={backgroundMedia.url} 
              alt="Login Background" 
              className="absolute w-full h-full object-cover"
            />
          )
        )}
        
        <div className="absolute inset-0 bg-black/30 z-10" />
      </div>
    </div>
  );
};
