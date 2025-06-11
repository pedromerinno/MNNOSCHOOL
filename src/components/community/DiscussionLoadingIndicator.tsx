
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DiscussionLoadingIndicatorProps {
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  currentCount?: number;
}

export const DiscussionLoadingIndicator: React.FC<DiscussionLoadingIndicatorProps> = ({
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  totalCount = 0,
  currentCount = 0
}) => {
  if (isLoadingMore) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <p className="text-sm text-gray-500">Carregando mais discussões...</p>
      </div>
    );
  }

  if (hasMore && onLoadMore) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-sm text-gray-500">
          Mostrando {currentCount} de {totalCount} discussões
        </p>
        <Button 
          variant="outline" 
          onClick={onLoadMore}
          className="rounded-full"
        >
          Carregar mais discussões
        </Button>
      </div>
    );
  }

  if (totalCount > 0 && !hasMore) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-sm text-gray-500">
          Todas as {totalCount} discussões foram carregadas
        </p>
      </div>
    );
  }

  return null;
};

export const DiscussionLoadingSkeletons: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-6 w-1/3" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
