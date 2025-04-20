
import React, { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="fixed w-full top-0 backdrop-blur-sm bg-white/80 z-50 border-b border-gray-100/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent tracking-tight">
            MERINNO
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 pt-24 pb-12 min-h-screen flex items-center justify-center">
        {children}
      </main>
    </div>
  );
};

export default OnboardingLayout;
