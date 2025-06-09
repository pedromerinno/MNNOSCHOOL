
import { Suspense, lazy, useState, useEffect } from "react";
import { IndexLoadingState } from "./IndexLoadingState";
import { EmptyCompanyState } from "./EmptyCompanyState";

const UserHome = lazy(() => import("@/components/home/UserHome").then(module => ({ default: module.UserHome })));

export const IndexContent = () => {
  const [showContent, setShowContent] = useState(false);

  // Simple delay to prevent immediate rendering loops
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    return (
      <div className="min-h-screen bg-background">
        <IndexLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      <Suspense fallback={<IndexLoadingState />}>
        <UserHome />
      </Suspense>
    </div>
  );
};
