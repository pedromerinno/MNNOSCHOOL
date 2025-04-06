
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { FileText, Settings, Users, Globe, Lock } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { useAuth } from '@/contexts/AuthContext';

const AdminPage = () => {
  const { userProfile } = useAuth();
  
  const adminSections = [
    { 
      title: 'Integração', 
      description: 'Gerencie informações de contratação', 
      icon: FileText, 
      path: '/admin/integration' 
    },
    { 
      title: 'Acessos', 
      description: 'Configurar ferramentas e acessos', 
      icon: Settings, 
      path: '/admin/access' 
    },
    { 
      title: 'Documentos', 
      description: 'Gerenciar documentos e contratos', 
      icon: Users, 
      path: '/admin/documents' 
    },
    { 
      title: 'Comunidade', 
      description: 'Configurações de comunicação', 
      icon: Globe, 
      path: '/admin/community' 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Painel Administrativo</h1>
        
        {/* User Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagement />
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Card 
              key={section.title} 
              className="hover:shadow-md transition-shadow dark:bg-gray-800"
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <section.icon className="text-gray-700 dark:text-gray-300" />
                  <span className="dark:text-white">{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {section.description}
                </p>
                <Link 
                  to={section.path} 
                  className="inline-flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Gerenciar <Lock size={16} className="ml-2" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
