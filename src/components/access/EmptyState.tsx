import { EmptyState as EmptyStateComponent } from "@/components/ui/empty-state";
import { Key, Lock, Shield } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({
  title,
  description
}: EmptyStateProps) => {
  return (
    <div className="w-full">
      <EmptyStateComponent
        title={title}
        description={description}
        icons={[Key, Lock, Shield]}
      />
    </div>
  );
};