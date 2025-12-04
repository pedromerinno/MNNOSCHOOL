
import { EmptyState as EmptyStateComponent } from "@/components/ui/empty-state";
import { Users, UserPlus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="flex justify-center">
      <EmptyStateComponent
        title={title}
        description={description}
        icons={[Users, UserPlus]}
      />
    </div>
  );
};
