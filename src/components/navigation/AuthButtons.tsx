
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AuthButtons = () => {
  return (
    <>
      <Button className="rounded-full bg-merinno-dark hover:bg-black text-white">
        <Link to="/login" className="flex items-center">
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Link>
      </Button>
      
      <Button variant="outline" className="rounded-full border-merinno-dark text-merinno-dark hover:bg-merinno-dark hover:text-white">
        <Link to="/signup" className="flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Cadastro
        </Link>
      </Button>
    </>
  );
};
