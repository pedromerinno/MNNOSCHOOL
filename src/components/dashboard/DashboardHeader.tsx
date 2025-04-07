
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MakeAdminButton } from "./MakeAdminButton";
import { Search } from "lucide-react";

export const DashboardHeader = () => {
  const { user, userProfile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-4 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md w-full md:w-64 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-4">
          <MakeAdminButton />
        </div>
      </div>
    </div>
  );
};
