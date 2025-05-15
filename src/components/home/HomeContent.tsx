
import { Suspense, lazy } from "react";
import { IndexLoadingState } from "./IndexLoadingState";

const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

export const HomeContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<IndexLoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};
