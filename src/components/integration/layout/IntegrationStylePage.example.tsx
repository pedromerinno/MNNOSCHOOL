/**
 * Exemplo de uso do IntegrationStylePage
 * 
 * Este arquivo demonstra como usar o componente IntegrationStylePage
 * para criar páginas no estilo da página de integração.
 */

import React from 'react';
import { 
  IntegrationStylePage, 
  IntegrationSection 
} from './IntegrationStylePage';
import { 
  BookOpen, 
  Users, 
  PlayCircle, 
  BriefcaseBusiness,
  GraduationCap,
  FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Exemplo básico de página usando IntegrationStylePage
 */
export const ExampleBasicPage: React.FC = () => {
  const sections = [
    { id: 'overview', label: 'Visão Geral', icon: BookOpen },
    { id: 'team', label: 'Time', icon: Users },
    { id: 'resources', label: 'Recursos', icon: FileText },
  ];

  return (
    <IntegrationStylePage
      title="Página de Exemplo"
      sections={sections}
      showBackButton={true}
      backPath="/"
    >
      {/* Seção com card e border beam */}
      <IntegrationSection
        id="overview"
        title="Visão Geral"
        subtitle="Informações gerais sobre a página"
        withCard={true}
        cardBorderBeam={true}
        delay={0.1}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Esta é uma seção de exemplo usando o IntegrationStylePage.
            O componente fornece um layout consistente e moderno.
          </p>
          <Button>Botão de Ação</Button>
        </div>
      </IntegrationSection>

      {/* Seção com card simples */}
      <IntegrationSection
        id="team"
        title="Nosso Time"
        withCard={true}
        delay={0.15}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Membro 1</CardTitle>
              <CardDescription>Descrição do membro</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Informações do membro do time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Membro 2</CardTitle>
              <CardDescription>Descrição do membro</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Informações do membro do time</p>
            </CardContent>
          </Card>
        </div>
      </IntegrationSection>

      {/* Seção sem card */}
      <IntegrationSection
        id="resources"
        title="Recursos"
        withCard={false}
        delay={0.2}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800">
          <ul className="space-y-2">
            <li>• Recurso 1</li>
            <li>• Recurso 2</li>
            <li>• Recurso 3</li>
          </ul>
        </div>
      </IntegrationSection>
    </IntegrationStylePage>
  );
};

/**
 * Exemplo com header customizado
 */
export const ExampleCustomHeader: React.FC = () => {
  const sections = [
    { id: 'content', label: 'Conteúdo', icon: BookOpen },
  ];

  return (
    <IntegrationStylePage
      title="Página com Header Customizado"
      sections={sections}
      customHeader={
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white">
          <h1 className="text-3xl font-bold mb-2">Header Personalizado</h1>
          <p className="text-blue-100">Descrição customizada com gradiente</p>
        </div>
      }
    >
      <IntegrationSection
        id="content"
        title="Conteúdo Principal"
        withCard={true}
      >
        <p>Conteúdo da página com header customizado</p>
      </IntegrationSection>
    </IntegrationStylePage>
  );
};

/**
 * Exemplo sem sidebar
 */
export const ExampleNoSidebar: React.FC = () => {
  return (
    <IntegrationStylePage
      title="Página Simples"
      showSidebar={false}
      sections={[]}
    >
      <div className="py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Página sem Sidebar</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Esta página não possui sidebar para um layout mais limpo.
          </p>
        </div>
      </div>
    </IntegrationStylePage>
  );
};

/**
 * Exemplo com diferentes direções de animação
 */
export const ExampleAnimations: React.FC = () => {
  const sections = [
    { id: 'up', label: 'Cima', icon: BookOpen },
    { id: 'down', label: 'Baixo', icon: Users },
    { id: 'left', label: 'Esquerda', icon: PlayCircle },
    { id: 'right', label: 'Direita', icon: BriefcaseBusiness },
    { id: 'fade', label: 'Fade', icon: GraduationCap },
  ];

  return (
    <IntegrationStylePage
      title="Exemplo de Animações"
      sections={sections}
    >
      <IntegrationSection
        id="up"
        title="Animação de Cima"
        direction="up"
        withCard={true}
      >
        <p>Esta seção aparece animando de cima para baixo</p>
      </IntegrationSection>

      <IntegrationSection
        id="down"
        title="Animação de Baixo"
        direction="down"
        withCard={true}
      >
        <p>Esta seção aparece animando de baixo para cima</p>
      </IntegrationSection>

      <IntegrationSection
        id="left"
        title="Animação da Esquerda"
        direction="left"
        withCard={true}
      >
        <p>Esta seção aparece animando da esquerda para direita</p>
      </IntegrationSection>

      <IntegrationSection
        id="right"
        title="Animação da Direita"
        direction="right"
        withCard={true}
      >
        <p>Esta seção aparece animando da direita para esquerda</p>
      </IntegrationSection>

      <IntegrationSection
        id="fade"
        title="Animação Fade"
        direction="fade"
        withCard={true}
      >
        <p>Esta seção aparece com efeito fade</p>
      </IntegrationSection>
    </IntegrationStylePage>
  );
};


