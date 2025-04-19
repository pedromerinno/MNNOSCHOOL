
import React from 'react';
import { PageHeader } from './PageHeader';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <PageHeader title={title} />
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
