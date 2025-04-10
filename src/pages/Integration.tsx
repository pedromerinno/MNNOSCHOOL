
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlaylist } from "@/components/integration/VideoPlaylist";

const Integration = () => {
  const { selectedCompany, isLoading } = useCompanies();

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
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                {selectedCompany 
                  ? `Bem-vindo ao processo de integração da ${selectedCompany.nome}` 
                  : "Bem-vindo ao processo de integração"}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {selectedCompany 
                  ? `Aqui você encontrará todas as informações sobre a ${selectedCompany.nome}, expectativas, 
                    descrição do cargo e tudo relacionado à sua contratação.`
                  : "Aqui você encontrará todas as informações sobre nossa empresa, expectativas, descrição do cargo e tudo relacionado à sua contratação."}
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 dark:text-white">
                    {selectedCompany 
                      ? `Sobre a ${selectedCompany.nome}` 
                      : "Sobre a empresa"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedCompany?.historia 
                      ? selectedCompany.historia.substring(0, 120) + "..." 
                      : "Conheça nossa história, valores e visão."}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 dark:text-white">Descrição do cargo</h3>
                  <p className="text-gray-600 dark:text-gray-400">Detalhes sobre suas responsabilidades e expectativas.</p>
                </div>
              </div>
              
              {/* Playlist de vídeos */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Vídeos de integração</h3>
                <VideoPlaylist 
                  companyId={selectedCompany?.id} 
                  mainVideo={selectedCompany?.video_institucional || ""}
                  mainVideoDescription={selectedCompany?.descricao_video || ""}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Integration;

