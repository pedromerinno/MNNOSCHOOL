
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationButton } from "./NotificationButton";
import { MobileMenu } from "./MobileMenu";
import { CompanySelector } from "./CompanySelector";

export const MobileNavigationMenu = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b shadow-sm bg-[#F8F7F4] dark:bg-[#191919] md:hidden">
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
