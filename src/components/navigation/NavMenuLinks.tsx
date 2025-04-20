
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  School, 
  Building, 
  FileText, 
  Settings,
  Book
} from "lucide-react";

interface NavMenuLinksProps {
  adminLabel?: string | null;
}

export const NavMenuLinks = ({ adminLabel }: NavMenuLinksProps) => {
  const { userProfile } = useAuth();
  const location = useLocation();

  const links = [
    { 
      href: "/", 
      label: "Início", 
      icon: <LayoutDashboard className="h-4 w-4" /> 
    },
    { 
      href: "/courses", 
      label: "Cursos", 
      icon: <BookOpen className="h-4 w-4" /> 
    },
    { 
      href: "/school", 
      label: "Escola", 
      icon: <School className="h-4 w-4" /> 
    },
    { 
      href: "/documents", 
      label: "Documentos", 
      icon: <FileText className="h-4 w-4" /> 
    },
  ];

  // Conditional admin link based on user's role
  const adminLinks = (userProfile?.is_admin || userProfile?.super_admin) 
    ? [{ 
        href: "/admin", 
        label: adminLabel || "Admin", 
        icon: <Users className="h-4 w-4" /> 
      }]
    : [];

  const allLinks = [...links, ...adminLinks];

  return (
    <nav className="flex items-center space-x-4">
      {allLinks.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className={`
            flex items-center gap-2 text-sm font-medium transition-colors 
            ${location.pathname === link.href 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-primary'
            }
          `}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </nav>
  );
};
