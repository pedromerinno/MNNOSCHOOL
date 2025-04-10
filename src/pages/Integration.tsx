
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlaylist } from "@/components/integration/VideoPlaylist";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, Building, Info } from "lucide-react";

const Integration = () => {
  const { selectedCompany, isLoading } = useCompanies();
  
  // Definir cor da empresa ou usar padrão se não disponível
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  // Estilo dinâmico com a cor da empresa
  const companyColorStyle = {
    color: companyColor,
    borderColor: companyColor
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Integração</h1>
        <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold mr-3 dark:text-white">
                  {selectedCompany 
                    ? `Bem-vindo ao processo de integração da ${selectedCompany.nome}` 
                    : "Bem-vindo ao processo de integração"}
                </h2>
                {selectedCompany && (
                  <CompanyThemedBadge variant="beta">Empresa</CompanyThemedBadge>
                )}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {selectedCompany 
                  ? `Aqui você encontrará todas as informações sobre a ${selectedCompany.nome}, expectativas, 
                    descrição do cargo e tudo relacionado à sua contratação.`
                  : "Aqui você encontrará todas as informações sobre nossa empresa, expectativas, descrição do cargo e tudo relacionado à sua contratação."}
              </p>

              <Tabs defaultValue="sobre" className="mt-6">
                <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 mb-6" style={{ '--tab-accent': companyColor } as React.CSSProperties}>
                  <TabsTrigger 
                    value="sobre" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm"
                    style={{ 
                      backgroundColor: 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Sobre a Empresa
                  </TabsTrigger>
                  <TabsTrigger 
                    value="videos" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm"
                    style={{ 
                      backgroundColor: 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Vídeos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cargo" 
                    className="data-[state=active]:text-white data-[state=active]:shadow-sm"
                    style={{ 
                      backgroundColor: 'transparent',
                      '--tw-data-[state=active]:bg-color': companyColor
                    } as React.CSSProperties}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Cargo
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sobre" className="mt-0">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={companyColorStyle}>
                        {selectedCompany 
                          ? `Sobre a ${selectedCompany.nome}` 
                          : "Sobre a empresa"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedCompany?.historia 
                          ? selectedCompany.historia
                          : "Conheça nossa história, valores e visão."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={companyColorStyle}>
                        Missão
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedCompany?.missao 
                          ? selectedCompany.missao
                          : "Nossa missão e propósito."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={companyColorStyle}>
                        Valores
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {selectedCompany?.valores 
                          ? selectedCompany.valores
                          : "Os valores que orientam nossas ações."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
                      <h3 className="font-medium mb-2 dark:text-white" style={companyColorStyle}>
                        Frase Institucional
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedCompany?.frase_institucional 
                          ? `"${selectedCompany.frase_institucional}"`
                          : "Nossa frase que resume nossa essência."}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="videos" className="mt-0">
                  <div className="mt-2">
                    <VideoPlaylist 
                      companyId={selectedCompany?.id} 
                      mainVideo={selectedCompany?.video_institucional || ""}
                      mainVideoDescription={selectedCompany?.descricao_video || ""}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="cargo" className="mt-0">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg" style={{borderLeft: `4px solid ${companyColor}`}}>
                    <h3 className="text-xl font-medium mb-4 dark:text-white" style={companyColorStyle}>
                      Descrição do Cargo
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {selectedCompany 
                        ? `Informações sobre sua função na ${selectedCompany.nome}.`
                        : "Informações sobre sua função na empresa."}
                    </p>
                    
                    <div className="prose dark:prose-invert max-w-none">
                      <p>Esta seção ainda está em construção. Em breve você encontrará aqui informações detalhadas sobre:</p>
                      <ul>
                        <li>Responsabilidades do cargo</li>
                        <li>Expectativas de desempenho</li>
                        <li>Estrutura hierárquica</li>
                        <li>Objetivos e metas</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Integration;
