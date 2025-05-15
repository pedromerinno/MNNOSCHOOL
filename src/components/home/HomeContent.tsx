
import { Suspense, lazy } from "react";
import { IndexLoadingState } from "./IndexLoadingState";

// Corrigindo a importação lazy para usar o default export
const UserHome = lazy(() => import("@/components/home/UserHome"));

export const HomeContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<IndexLoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};
