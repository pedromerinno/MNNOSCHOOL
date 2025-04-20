
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
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
          className="absolute w-full h-full object-cover opacity-70"
        >
          <source src="/lovable-uploads/background-video.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
        
        <div className="absolute inset-0 bg-merinno-blue/50 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <h2 className="text-4xl font-light mb-2">criando o</h2>
            <h1 className="text-5xl font-medium">impossível</h1>
          </div>
        </div>
      </div>
    </div>
  );
};
