
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";

const Integration = () => {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigationMenu />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Integração</h1>
        <div className="bg-white dark:bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Bem-vindo ao processo de integração</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Aqui você encontrará todas as informações sobre nossa empresa, expectativas, 
            descrição do cargo e tudo relacionado à sua contratação.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2 dark:text-white">Sobre a empresa</h3>
              <p className="text-gray-600 dark:text-gray-400">Conheça nossa história, valores e visão.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2 dark:text-white">Descrição do cargo</h3>
              <p className="text-gray-600 dark:text-gray-400">Detalhes sobre suas responsabilidades e expectativas.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Integration;
