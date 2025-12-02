
import { IndexContent } from "@/components/home/IndexContent";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

const Index = () => {
  return (
    <ErrorBoundary>
      <IndexContent />
    </ErrorBoundary>
  );
};

export default Index;
