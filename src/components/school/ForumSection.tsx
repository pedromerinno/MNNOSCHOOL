
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ForumTopic {
  id: string;
  title: string;
  tags: string[];
}

interface ForumSectionProps {
  topics: ForumTopic[];
}

export const ForumSection: React.FC<ForumSectionProps> = ({ topics }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {topics.map((topic, index) => (
          <Card key={topic.id} className="overflow-hidden border shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-2 mb-2">
                {topic.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-medium text-sm">{topic.title}</h3>
              <div className="flex items-center gap-1 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="w-6 h-6 bg-gray-300 rounded-full overflow-hidden border border-white">
                      <img 
                        src={`https://i.pravatar.cc/100?img=${index * 3 + num}`} 
                        alt="User avatar" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500">+5</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
