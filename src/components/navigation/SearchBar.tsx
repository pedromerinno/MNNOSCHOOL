
import { Search } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

export const SearchBar = () => {
  const { selectedCompany } = useCompanies();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setOpen(false);
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleSelect = (courseId: string) => {
    setOpen(false);
    navigate(`/courses/${courseId}`);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim() || !selectedCompany?.id) return setSuggestions([]);
      
      const { data: companyAccess } = await supabase
        .from('company_courses')
        .select('course_id')
        .eq('empresa_id', selectedCompany.id);
        
      if (!companyAccess || companyAccess.length === 0) return setSuggestions([]);
      
      const courseIds = companyAccess.map(access => access.course_id);
      
      const { data } = await supabase
        .from('courses')
        .select('id, title, tags')
        .in('id', courseIds)
        .ilike('title', `%${searchQuery}%`)
        .limit(5);
        
      setSuggestions(data || []);
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCompany?.id]);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  return (
    <>
      <div className="relative w-64">
        <div 
          className={cn(
            "flex items-center rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer",
            "focus-within:ring-2 focus-within:ring-offset-0",
            "focus-within:ring-opacity-50"
          )}
          onClick={() => setOpen(true)}
          style={{ 
            "--tw-ring-color": `${companyColor}40`
          } as React.CSSProperties}
        >
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full bg-transparent border-0 p-0 h-8 text-sm focus:outline-none"
          />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput 
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Digite para pesquisar cursos..."
          />
          <CommandList>
            <CommandEmpty>Nenhum curso encontrado.</CommandEmpty>
            <CommandGroup heading="Cursos sugeridos">
              {suggestions.map((course) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => handleSelect(course.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div>
                    <div className="font-medium">{course.title}</div>
                    {course.tags && (
                      <div className="text-sm text-gray-500">
                        {course.tags.join(' • ')}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};
