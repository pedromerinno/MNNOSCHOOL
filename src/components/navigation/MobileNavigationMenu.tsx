
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationButton } from "./NotificationButton";
import { MobileMenu } from "./MobileMenu";
import { CompanySelector } from "./CompanySelector";

export const MobileNavigationMenu = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b shadow-sm bg-[#F8F7F4] dark:bg-[#191919] lg:hidden pt-safe-top">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MobileMenu />
          <div className="flex items-center">
            <CompanySelector />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <SearchBar />
          <ThemeToggle />
          <NotificationButton />
        </div>
      </div>
    </header>
  );
};
