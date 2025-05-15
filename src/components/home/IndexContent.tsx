
import { Suspense, lazy } from "react";
import { IndexLoadingState } from "./IndexLoadingState";

// Corrigindo a importação lazy para usar o default export
const UserHome = lazy(() => import("@/components/home/UserHome"));

export const IndexContent = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <Suspense fallback={<IndexLoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};
