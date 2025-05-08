
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

interface ForumTopic {
  id: string;
  title: string;
  tags: string[];
}

interface ForumSectionProps {
  topics: ForumTopic[];
}

export const ForumSection: React.FC<ForumSectionProps> = ({ topics }) => {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fórum</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <Card 
            key={topic.id} 
            className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <CardContent className="p-5">
              <div className="flex gap-2 mb-3 flex-wrap">
                {topic.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: `${companyColor}20`, 
                      color: companyColor 
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-medium text-base mb-4">{topic.title}</h3>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((num) => (
                      <div 
                        key={num} 
                        className="w-7 h-7 overflow-hidden border-2 border-white rounded-full"
                        style={{ backgroundColor: `${companyColor}${num * 20}` }}
                      >
                        <img 
                          src={`https://i.pravatar.cc/100?img=${index * 3 + num}`} 
                          alt="User avatar" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">+5</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs rounded-full px-3 hover:bg-gray-100"
                  style={{ color: companyColor }}
                >
                  Ver discussão
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
