import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";
interface EmptyStateProps {
  title: string;
  description: string;
}
export const EmptyState = ({
  title,
  description
}: EmptyStateProps) => {
  return <Card className="mx-auto bg-white dark:bg-gray-800">
      <CardContent className="flex flex-col items-center justify-center px-6 py-[80px]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-100/0">
          <Key className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-center text-zinc-400 font-normal text-sm px-[240px] py-[10px]">
          {description}
        </p>
      </CardContent>
    </Card>;
};