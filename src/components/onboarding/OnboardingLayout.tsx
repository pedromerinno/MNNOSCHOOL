
import React, { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="py-6 px-8 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          MERINNO
        </h1>
      </header>
      <main className="container mx-auto px-4 py-8 md:py-12">{children}</main>
    </div>
  );
};

export default OnboardingLayout;
