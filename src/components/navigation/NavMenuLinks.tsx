
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Book, BookOpen } from "lucide-react";

export const NavMenuLinks = () => {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  
  const isAdmin = userProfile?.isAdmin === true;

  const isCurrentPage = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  return (
    <nav>
      <ul className="flex items-center space-x-8">
        <li>
          <Link 
            to="/" 
            className={cn(
              "text-sm text-[rgb(107_114_128)] dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light px-3 py-2",
              isCurrentPage('/') && "font-bold text-gray-700"
            )}
          >
            Home
          </Link>
        </li>
        <li>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={cn(
                    "bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-[rgb(107_114_128)] dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light text-sm px-3 py-2",
                    (isCurrentPage('/courses') || isCurrentPage('/my-courses')) && "font-bold text-gray-700"
                  )}
                >
                  <span>School</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2 bg-white dark:bg-gray-800">
                    <li>
                      <Link
                        to="/courses"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          <Book className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">All Courses</span>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-500 dark:text-gray-400">
                          View all courses available in your company
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/my-courses"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dashboard</span>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-500 dark:text-gray-400">
                          Favorited and ongoing courses
                        </p>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </li>
        <li>
          <Link 
            to="/community" 
            className={cn(
              "text-sm text-[rgb(107_114_128)] dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light px-3 py-2",
              isCurrentPage('/community') && "font-bold text-gray-700"
            )}
          >
            Comunidade
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link 
              to="/admin" 
              className={cn(
                "text-sm text-[rgb(107_114_128)] dark:text-gray-300 hover:text-merinno-primary hover:dark:text-merinno-primary-light px-3 py-2",
                isCurrentPage('/admin') && "font-bold text-gray-700"
              )}
            >
              Admin
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};
