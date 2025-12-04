import React from 'react';
import { LayoutGrid, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'cards' | 'table';
  onViewChange: (view: 'cards' | 'table') => void;
  companyColor?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  view,
  onViewChange,
  companyColor = "#1EAEDB"
}) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('cards')}
        className={cn(
          "gap-2 rounded-md transition-all",
          view === 'cards' 
            ? "bg-white dark:bg-gray-700 shadow-sm" 
            : "hover:bg-transparent"
        )}
        style={view === 'cards' ? {
          color: companyColor
        } : {}}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Cards</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('table')}
        className={cn(
          "gap-2 rounded-md transition-all",
          view === 'table' 
            ? "bg-white dark:bg-gray-700 shadow-sm" 
            : "hover:bg-transparent"
        )}
        style={view === 'table' ? {
          color: companyColor
        } : {}}
      >
        <Table2 className="h-4 w-4" />
        <span className="hidden sm:inline">Tabela</span>
      </Button>
    </div>
  );
};



