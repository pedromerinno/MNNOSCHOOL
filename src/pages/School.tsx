import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeaturedCourseHero } from "@/components/school/FeaturedCourseHero";
import { ContinueLearning } from "@/components/school/ContinueLearning";
import { ForumSection } from "@/components/school/ForumSection";
import { RecentCourses } from "@/components/school/RecentCourses";
import { SchoolSidebar } from "@/components/school/SchoolSidebar";

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
  
  const statistics = {
    completedVideos: 12,
    hoursWatched: 45
  };
  
  const suggestedTopics = [
    { id: "1", name: "Design de Personagens" },
    { id: "2", name: "UI/UX Avançado" },
    { id: "3", name: "Animação 3D" },
    { id: "4", name: "Identidade Visual" }
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

            <ContinueLearning courses={continueLearningCourses} />
            <ForumSection topics={forumTopics} />
            <RecentCourses courses={recentCourses} />
          </div>

          <SchoolSidebar 
            statistics={statistics}  
            suggestedTopics={suggestedTopics}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default School;
