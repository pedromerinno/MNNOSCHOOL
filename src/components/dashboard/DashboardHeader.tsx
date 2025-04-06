
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MakeAdminButton } from "./MakeAdminButton";

export const DashboardHeader = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4">
        <MakeAdminButton />
      </div>
    </div>
  );
};
