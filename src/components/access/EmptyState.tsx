
import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <Key className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
