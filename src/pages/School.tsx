
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Play, Clock, Heart, Users, Search, ChevronRight, ChevronLeft } from "lucide-react";

const School = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Featured course
  const featuredCourse = {
    id: "1",
    title: "Como construir um bom fluxograma",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
    instructor: "Pedro",
    tags: ["IA", "Ilustração", "Conceitos"]
  };

  // Continue learning courses
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

  // Forum topics
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

  // Recent courses
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

  // Statistics
  const statistics = {
    completedVideos: 2,
    hoursWatched: 3.5
  };

  // Suggested topics
  const suggestedTopics = [
    { id: "15", name: "UI & UI", icon: "globe" },
    { id: "16", name: "Motion Designer", icon: "video" }
  ];

  const categories = [
    { id: "all", name: "Todos" },
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
    <div className="bg-white">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Featured Course */}
          <div className="mb-12">
            <div className="relative rounded-xl overflow-hidden">
              <div className="h-72 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                <img 
                  src={featuredCourse.image}
                  alt={featuredCourse.title}
                  className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{featuredCourse.title}</h1>
                    <div className="flex gap-2 mt-4">
                      {featuredCourse.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 text-xs rounded-full bg-black/30 text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs">{featuredCourse.instructor.charAt(0)}</span>
                      </div>
                      <span className="text-white">{featuredCourse.instructor}</span>
                    </div>
                    <Button variant="default" className="rounded-full px-4 bg-white text-black hover:bg-gray-100">
                      <span>Assistir agora</span>
                      <Play className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          {/* Continue Learning */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Continue assistindo</h2>
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
              {continueLearningCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden border-0 shadow-sm">
                  <div className="relative h-44">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex gap-2 mb-2">
                      {course.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-medium mb-2">{course.title}</h3>
                    {course.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 h-1 rounded-full">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Forum */}
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
              {forumTopics.map((topic) => (
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
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                        <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">+5</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Courses */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cursos recentes</h2>
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
              {recentCourses.slice(0, 6).map((course) => (
                <Card key={course.id} className="overflow-hidden border-0 shadow-sm">
                  <div className="relative h-44">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex gap-2 mb-2">
                        {course.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 text-xs rounded-full bg-black/30 text-white"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-medium text-white">{course.title}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 p-6 border-l border-gray-100">
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
              {suggestedTopics.map((topic) => (
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
  );
};

export default School;
