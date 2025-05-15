
import { Suspense, lazy } from "react";
import { IndexLoadingState } from "./IndexLoadingState";

// Fix: properly import UserHome as a default export
const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ 
  default: module.UserHome 
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
