
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
  return (
    <div className="relative w-64">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Pesquisar..."
        className="pl-8 h-9 focus-visible:ring-merinno-blue"
      />
    </div>
  );
};
