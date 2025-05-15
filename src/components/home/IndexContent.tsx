
import { Suspense, lazy } from "react";
import { IndexLoadingState } from "./IndexLoadingState";

// Corrigir a importação do UserHome
const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ 
  default: module.UserHome || module.default 
})));

export const IndexContent = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <Suspense fallback={<IndexLoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};
