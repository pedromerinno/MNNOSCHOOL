
import { Search } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { fetchCourses } from "@/services/courseService";
import { DialogTitle } from "@/components/ui/dialog";

export const SearchBar = () => {
  const { selectedCompany } = useCompanies();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  
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

  // Fetch all courses once when component mounts or company changes
  useEffect(() => {
    const loadAllCourses = async () => {
      if (!selectedCompany?.id) return;
      
      try {
        console.log("Fetching courses for company:", selectedCompany.id);
        const allCourses = await fetchCourses(selectedCompany.id);
        console.log("Loaded", allCourses.length, "courses for company", selectedCompany.id);
        setCourses(allCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    
    loadAllCourses();
  }, [selectedCompany?.id]);

  // This function filters the already loaded courses
  const performSearch = useCallback(() => {
    if (!searchQuery.trim() || courses.length === 0) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Filtering courses for:", searchQuery);
      
      // Filter courses based on search query
      const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.tags && course.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      ).slice(0, 5); // Limit to 5 suggestions
      
      console.log("Found courses:", filteredCourses.length);
      setSuggestions(filteredCourses);
    } catch (error) {
      console.error("Error filtering courses:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, courses]);

  // Handle input change from either search input
  const handleInputChange = (value: string) => {
    console.log("Input changed to:", value);
    setSearchQuery(value);
  };

  // This useEffect will run the search whenever searchQuery changes
  useEffect(() => {
    // Immediate search for better responsiveness
    performSearch();
  }, [searchQuery, performSearch]);

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
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full bg-transparent border-0 p-0 h-8 text-sm focus:outline-none"
          />
        </div>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg">
          <Command className="rounded-lg border-none bg-transparent">
            <div className="flex flex-col">
              <DialogTitle className="sr-only">Pesquisar cursos</DialogTitle>
              <CommandInput 
                value={searchQuery}
                onValueChange={(value) => {
                  handleInputChange(value);
                  // Ensure immediate search happens here too
                  performSearch();
                }}
                placeholder="Digite para pesquisar cursos..."
                className="border-b border-gray-200 dark:border-gray-700"
              />
              <CommandList className="max-h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    Buscando cursos...
                  </div>
                ) : suggestions.length === 0 && searchQuery ? (
                  <CommandEmpty>Nenhum curso encontrado.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Cursos sugeridos">
                    {suggestions.map((course) => (
                      <CommandItem
                        key={course.id}
                        onSelect={() => handleSelect(course.id)}
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {/* Course thumbnail */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {course.image_url ? (
                            <img 
                              src={course.image_url} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{course.title}</div>
                          {course.tags && (
                            <div className="text-sm text-gray-500 truncate">
                              {course.tags.join(' • ')}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </div>
          </Command>
        </div>
      </CommandDialog>
    </>
  );
};
