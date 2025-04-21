
import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <Card className="mx-auto bg-white dark:bg-gray-800">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
          <Key className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
