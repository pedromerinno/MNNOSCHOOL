import * as React from "react";
import { ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Maximize2, RotateCcw, MessageSquare, Sparkles, BookOpen, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AIChatLayoutProps {
  // Breadcrumbs
  breadcrumbs?: Array<{ label: string; href?: string }>;
  
  // Sidebar content
  sidebarContent?: ReactNode;
  
  // Main chat area
  chatContent: ReactNode;
  
  // Custom header actions
  headerActions?: ReactNode;
  
  // Company info for sidebar
  companyName?: string;
  companyLogo?: string;
}

export function AIChatLayout({
  breadcrumbs = [{ label: "Chat IA" }],
  sidebarContent,
  chatContent,
  headerActions,
  companyName,
  companyLogo,
}: AIChatLayoutProps) {
  const defaultSidebarContent = (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              Chat IA
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Assistente virtual
            </p>
          </div>
        </div>
      </div>

      {/* Company Info */}
      {companyName && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Empresa
          </p>
          <div className="flex items-center gap-2">
            {companyLogo && (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-6 h-6 rounded object-cover"
              />
            )}
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
              {companyName}
            </p>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Dicas rápidas
        </h3>
        <div className="space-y-2">
          <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Pergunte sobre processos, documentação ou qualquer dúvida relacionada à sua empresa.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Use markdown para formatar suas mensagens: **negrito**, *itálico*, `código`.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Exemplos
        </h3>
        <div className="space-y-2">
          <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer">
            <CardContent className="p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                "Como utilizar o Asana?"
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer">
            <CardContent className="p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                "Qual meu processo de integração?"
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer">
            <CardContent className="p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                "Quais são os recursos disponíveis?"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documentation */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Sobre
        </h3>
        <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Este assistente de IA está configurado especificamente para sua empresa e pode ajudar com dúvidas sobre processos, documentação e recursos disponíveis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 h-14">
          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">{crumb.label}</span>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {headerActions || (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="w-[420px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto">
          <div className="p-6">
            {sidebarContent || defaultSidebarContent}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 min-w-0 relative overflow-hidden bg-white dark:bg-gray-950">
          {chatContent}
        </main>
      </div>
    </div>
  );
}
