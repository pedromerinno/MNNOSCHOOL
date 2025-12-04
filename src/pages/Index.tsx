
import { Suspense, memo } from "react";
import { IndexContent } from "@/components/home/IndexContent";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Preloader } from "@/components/ui/Preloader";

const Index = memo(() => {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <IndexContent />
      </Suspense>
    </ErrorBoundary>
  );
});
Index.displayName = 'Index';

export default Index;
