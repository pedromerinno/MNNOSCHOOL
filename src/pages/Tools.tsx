
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { ExternalLink, Figma, FileText, Mail, ShieldCheck, Slack } from 'lucide-react';

const Tools = () => {
  const tools = [
    { 
      title: 'Google Workspace', 
      description: 'Email, Drive, Documentos e Calendário', 
      icon: Mail, 
      link: 'https://workspace.google.com',
      category: 'Produtividade'
    },
    { 
      title: 'Figma', 
      description: 'Ferramenta de design e prototipagem', 
      icon: Figma, 
      link: 'https://figma.com',
      category: 'Design'
    },
    { 
      title: 'Slack', 
      description: 'Comunicação e colaboração da equipe', 
      icon: Slack, 
      link: 'https://slack.com',
      category: 'Comunicação'
    },
    { 
      title: 'Adobe Creative Cloud', 
      description: 'Suite de aplicativos de design', 
      icon: FileText, 
      link: 'https://adobe.com/creativecloud',
      category: 'Design'
    },
    { 
      title: 'Envato Elements', 
      description: 'Recursos de design e templates', 
      icon: FileText, 
      link: 'https://elements.envato.com',
      category: 'Recursos'
    },
    { 
      title: 'LastPass', 
      description: 'Gerenciador de senhas seguro', 
      icon: ShieldCheck, 
      link: 'https://lastpass.com',
      category: 'Segurança'
    },
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Ferramentas</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Acesse todas as ferramentas necessárias para realizar seu trabalho. Clique em qualquer ferramenta para abrir em uma nova aba.
      </p>
      
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">{category}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools
              .filter(tool => tool.category === category)
              .map((tool) => (
                <Card 
                  key={tool.title} 
                  className="hover:shadow-md transition-shadow dark:bg-gray-800"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <tool.icon className="text-gray-700 dark:text-gray-300" />
                      <span className="dark:text-white">{tool.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {tool.description}
                    </p>
                    <a 
                      href={tool.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Acessar <ExternalLink size={16} className="ml-2" />
                    </a>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tools;
