import * as React from "react";
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Copy, Code2, ExternalLink, Maximize2, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComponentPlaygroundProps {
  // Breadcrumbs
  breadcrumbs: Array<{ label: string; href?: string }>;
  
  // Component info
  title: string;
  description: string;
  creator?: {
    name: string;
    handle?: string;
    logo?: ReactNode;
  };
  
  // Installation
  installation?: {
    command: string;
  };
  
  // Usage
  usage?: {
    code: string;
    prompt?: string;
  };
  
  // Website link
  website?: string;
  
  // Dates
  createdDate?: string;
  updatedDate?: string;
  
  // Preview area
  preview: ReactNode;
  
  // Custom header actions
  headerActions?: ReactNode;
}

export function ComponentPlayground({
  breadcrumbs,
  title,
  description,
  creator,
  installation,
  usage,
  website,
  createdDate,
  updatedDate,
  preview,
  headerActions,
}: ComponentPlaygroundProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

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
          <div className="p-6 space-y-8">
            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>

            {/* Creator */}
            {creator && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Created by
                </p>
                <div className="flex items-center gap-2">
                  {creator.logo && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {creator.logo}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {creator.name}
                    </p>
                    {creator.handle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{creator.handle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Installation */}
            {installation && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Installation
                </h2>
                <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-3">
                    <code className="text-xs text-gray-900 dark:text-gray-100 font-mono">
                      {installation.command}
                    </code>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Usage */}
            {usage && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  How to use
                </h2>
                <div className="flex gap-2">
                  {usage.prompt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(usage.prompt!, "prompt")}
                      className="text-xs"
                    >
                      {copied === "prompt" ? "Copied!" : "Copy prompt"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(usage.code, "code")}
                    className="text-xs"
                  >
                    {copied === "code" ? "Copied!" : "Copy code"}
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Code2 className="h-3 w-3 mr-1" />
                    View code
                  </Button>
                </div>
                <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <pre className="text-xs text-gray-900 dark:text-gray-100 font-mono overflow-x-auto">
                      <code>{usage.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Website */}
            {website && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Website
                </h2>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Dates */}
            {(createdDate || updatedDate) && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {createdDate && <p>Created {createdDate}</p>}
                  {updatedDate && <p>Updated {updatedDate}</p>}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="h-full flex items-center justify-center p-12">
            <div className="w-full max-w-5xl">{preview}</div>
          </div>
        </main>
      </div>
    </div>
  );
}



