
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [videoUrl, setVideoUrl] = useState<string>("/lovable-uploads/background-video.mp4");

  useEffect(() => {
    const fetchVideoUrl = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'login_background_video')
        .single();

      if (!error && data?.value) {
        setVideoUrl(data.value);
      }
    };

    fetchVideoUrl();
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
      
      {/* Right side - Video Background */}
      <div className="w-full md:w-1/2 bg-merinno-blue relative overflow-hidden hidden md:block">
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
        
        <div className="absolute inset-0 bg-black/30 z-10" />
      </div>
    </div>
  );
};
