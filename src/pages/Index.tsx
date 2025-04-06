
import { MainNavigationMenu } from "@/components/home/NavigationMenu";
import { UserHome } from "@/components/home/UserHome";

const Index = () => {
  return (
    <div className="min-h-screen bg-background custom-cursor-area">
      <MainNavigationMenu />
      <UserHome />
    </div>
  );
};

export default Index;
