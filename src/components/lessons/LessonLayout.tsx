import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

interface LessonLayoutProps {
  children: ReactNode;
}

export const LessonLayout = ({ children }: LessonLayoutProps) => {
  return (
    <div className="lesson-layout min-h-screen bg-[#F8F7F4] dark:bg-[#111111] w-full">
      <div className="w-full">
        <div className="w-full p-4 lg:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

