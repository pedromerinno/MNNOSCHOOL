
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const NavMenuLinks = () => {
  const { userProfile } = useAuth();
  
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
        Home
      </Link>
      <Link to="/team" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
        Time
      </Link>
      {(userProfile?.is_admin || userProfile?.super_admin) && (
        <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          Admin
        </Link>
      )}
    </nav>
  );
};
