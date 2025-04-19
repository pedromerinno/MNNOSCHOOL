import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeaturedCourseHero } from "@/components/school/FeaturedCourseHero";
import { ContinueLearning } from "@/components/school/ContinueLearning";
import { ForumSection } from "@/components/school/ForumSection";
import { RecentCourses } from "@/components/school/RecentCourses";

const School = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Featured course data
  const featuredCourse = {
    id: "1",
    title: "Como construir um bom fluxograma",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop",
    instructor: "Pedro",
    tags: ["IA", "Ilustração", "Conceitos"]
  };

  // Course data
  const continueLearningCourses = [
    {
      id: "2",
      title: "Criar um Personagem do Zero",
      image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração", "Conceitos"],
      progress: 75
    },
    {
      id: "3",
      title: "Criar um Personagem do Zero",
      image: "https://images.unsplash.com/photo-1581092792068-7e0ce8c4d473?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração", "Conceitos"],
      progress: 30
    },
    {
      id: "4",
      title: "Criar um Personagem do Zero",
      image: "https://images.unsplash.com/photo-1581092435635-656d4653531d?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração", "Conceitos"],
      progress: 0
    }
  ];

  const forumTopics = [
    {
      id: "5",
      title: "Como construir um Figma de sucesso para projetos UI",
      tags: ["IA", "Ilustração"]
    },
    {
      id: "6",
      title: "Como construir um Figma de sucesso para projetos UI",
      tags: ["IA", "Ilustração"]
    },
    {
      id: "7",
      title: "Como construir um Figma de sucesso para projetos UI",
      tags: ["IA", "Ilustração"]
    },
    {
      id: "8",
      title: "Como construir um Figma de sucesso para projetos UI",
      tags: ["IA", "Ilustração"]
    }
  ];

  const recentCourses = [
    {
      id: "9",
      title: "Criar um Personagem do Zero",
      image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração"]
    },
    {
      id: "10",
      title: "Motion design Pro",
      image: "https://images.unsplash.com/photo-1581092871442-4f7812355e08?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração"]
    },
    {
      id: "11",
      title: "Processo de criação ONMX",
      image: "https://images.unsplash.com/photo-1581093458791-4b00575be0d4?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração"]
    },
    {
      id: "12",
      title: "Criar um Personagem do Zero",
      image: "https://images.unsplash.com/photo-1581093458728-ff8c3ea73c3b?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração"]
    },
    {
      id: "13",
      title: "Criar um Personagem do Zero",
      image: "https://images.unsplash.com/photo-1581093588448-45e91d7aee94?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração"]
    },
    {
      id: "14",
      title: "Criar um Personagem do Zero",
      image: "https://images.unsplash.com/photo-1581093578584-8a3f6bfce8b6?w=800&h=600&fit=crop",
      tags: ["IA", "Ilustração"]
    }
  ];

  const categories = [
    { id: "all", name: "Todos os Cursos" },
    { id: "3d", name: "3D" },
    { id: "brand", name: "Brand" },
    { id: "motion", name: "Motion Design" },
    { id: "design", name: "Design" },
    { id: "planning", name: "Planejamento" }
  ];

  const handleCategoryChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <DashboardLayout>
      <div className="bg-[#F8F7F4] py-6">
        <div className="container mx-auto px-4 lg:px-8 flex">
          {/* Main Content */}
          <div className="flex-1 pr-6">
            {/* Featured Course */}
            <FeaturedCourseHero course={featuredCourse} />

            {/* Categories */}
            <div className="mb-8">
              <Tabs defaultValue="all" value={activeTab} onValueChange={handleCategoryChange}>
                <TabsList className="overflow-x-auto w-full justify-start bg-transparent py-1">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className={`rounded-full px-4 py-2 ${
                        activeTab === category.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Continue Learning Section */}
            <ContinueLearning courses={continueLearningCourses} />

            {/* Forum Section */}
            <ForumSection topics={forumTopics} />

            {/* Recent Courses Section */}
            <RecentCourses courses={recentCourses} />
          </div>

          {/* Sidebar */}
          <div className="w-72 border-l border-gray-100 pl-6">
            {/* Stats */}
            <div className="mb-8">
              <div className="bg-amber-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium mb-2">Vídeos completos</h3>
                <p className="text-4xl font-bold">{statistics.completedVideos.toString().padStart(2, '0')}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Horas assistidas</h3>
                  <div className="flex items-center text-xs">
                    <span>Ano</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">{statistics.hoursWatched} horas</p>
                
                <div className="flex items-center text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Bom trabalho</span>
                </div>
                
                <div className="mt-4 h-24 flex items-end justify-between">
                  {[40, 60, 30, 80, 50, 75, 45, 65, 55, 35, 70, 25].map((height, i) => (
                    <div key={i} className="w-1.5 bg-blue-400 rounded-t" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Jan</span>
                  <span>Fev</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>Mai</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Ago</span>
                  <span>Set</span>
                  <span>Out</span>
                  <span>Nov</span>
                  <span>Dez</span>
                </div>
              </div>
            </div>
            
            {/* Suggested Topics */}
            <div>
              <h3 className="text-sm font-medium mb-4">Temas Sugeridos</h3>
              <div className="space-y-2">
                {suggestedTopics.map((topic, index) => (
                  <Card key={topic.id} className="overflow-hidden border shadow-sm">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Search className="h-4 w-4 text-green-600" />
                        </div>
                        <span>{topic.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default School;
