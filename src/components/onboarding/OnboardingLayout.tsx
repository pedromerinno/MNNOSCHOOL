
import React, { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-merinno-light to-white">
      <header className="py-6 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-merinno-dark">MERINNO</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default OnboardingLayout;
