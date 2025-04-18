
import { Users } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
        <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
      </div>
      <h2 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
};
