
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 bg-merinno-light p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-merinno-dark">MERINNO</h1>
          </div>
          {children}
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="w-full md:w-1/2 bg-merinno-blue relative overflow-hidden hidden md:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-light mb-2">criando o</h2>
            <h1 className="text-5xl font-medium">impossível</h1>
          </div>
        </div>
        
        {/* Floating bubbles */}
        <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-white opacity-80 rounded-full floating-bubble"></div>
        <div className="absolute top-1/3 left-1/3 w-6 h-6 bg-white opacity-60 rounded-full floating-bubble floating-bubble-delay-1"></div>
        <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-white opacity-70 rounded-full floating-bubble floating-bubble-delay-2"></div>
      </div>
    </div>
  );
};
