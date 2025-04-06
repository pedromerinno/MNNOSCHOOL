
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseView } from "@/components/courses/CourseView";

// Example course data
const courseData = {
  id: "1",
  title: "Introdução ao Marketing Digital",
  instructor: "Maria Silva",
  description: "Neste curso, você aprenderá os fundamentos do marketing digital, desde a criação de estratégias eficazes até a implementação de campanhas em diferentes plataformas. Vamos explorar conceitos como SEO, marketing de conteúdo, mídia social e análise de dados para ajudá-lo a desenvolver habilidades essenciais para o mercado atual.",
  image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  progress: 75,
  modules: [
    {
      id: "m1",
      title: "Módulo 1: Fundamentos do Marketing Digital",
      lessons: [
        {
          id: "l1",
          title: "Introdução ao Marketing Digital",
          duration: "15 min",
          completed: true,
          type: "video",
        },
        {
          id: "l2",
          title: "A Evolução do Marketing",
          duration: "20 min",
          completed: true,
          type: "video",
        },
        {
          id: "l3",
          title: "Quiz: Conceitos Básicos",
          duration: "10 min",
          completed: true,
          type: "quiz",
        },
      ],
    },
    {
      id: "m2",
      title: "Módulo 2: Estratégias de SEO",
      lessons: [
        {
          id: "l4",
          title: "Fundamentos de SEO",
          duration: "25 min",
          completed: true,
          type: "video",
        },
        {
          id: "l5",
          title: "Pesquisa de Palavras-chave",
          duration: "30 min",
          completed: true,
          type: "video",
        },
        {
          id: "l6",
          title: "Otimização On-page",
          duration: "20 min",
          completed: false,
          type: "video",
        },
        {
          id: "l7",
          title: "Leitura: Guia de SEO",
          duration: "15 min",
          completed: false,
          type: "text",
        },
      ],
    },
    {
      id: "m3",
      title: "Módulo 3: Marketing de Conteúdo",
      lessons: [
        {
          id: "l8",
          title: "Estratégias de Conteúdo",
          duration: "25 min",
          completed: false,
          type: "video",
        },
        {
          id: "l9",
          title: "Criação de Blog Eficaz",
          duration: "20 min",
          completed: false,
          type: "video",
        },
        {
          id: "l10",
          title: "Distribuição de Conteúdo",
          duration: "15 min",
          completed: false,
          type: "video",
        },
        {
          id: "l11",
          title: "Quiz: Marketing de Conteúdo",
          duration: "10 min",
          completed: false,
          type: "quiz",
        },
      ],
    },
  ],
};

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  // In a real application, we would fetch the course data based on the courseId
  // For this demo, we're using static data
  
  return (
    <DashboardLayout>
      <CourseView {...courseData} />
    </DashboardLayout>
  );
};

export default CourseDetails;
