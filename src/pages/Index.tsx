
import { MainNavigationMenu } from "@/components/home/NavigationMenu";
import { UserHome } from "@/components/home/UserHome";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigationMenu />
      <UserHome />
    </div>
  );
};

export default Index;
