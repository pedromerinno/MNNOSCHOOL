import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const NavMenuLinks = () => {
  const { user } = useAuth();

  const adminLinks = user?.email === 'admin@merinno.com' ? (
    <li>
      <Link 
        to="/admin" 
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light"
      >
        <Settings size={20} />
        <span>Admin</span>
      </Link>
    </li>
  ) : null;

  return (
    <nav>
      <ul className="flex items-center space-x-6">
        <li>
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light">
            Home
          </Link>
        </li>
        <li>
          <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light">
            Cursos
          </Link>
        </li>
        {adminLinks}
      </ul>
    </nav>
  );
};
