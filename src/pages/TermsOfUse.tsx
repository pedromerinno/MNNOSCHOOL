
import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfUse = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-2">
            <Link to="/signup">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Cadastro
            </Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-semibold mb-6">Termos de Uso</h1>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-medium mb-4">1. Aceitação dos Termos</h2>
          <p className="mb-4">
            Ao acessar ou usar nossos serviços, você concorda em ficar vinculado a estes Termos de Uso. Se você não concordar com algum aspecto destes termos, não poderá usar nossos serviços.
          </p>
          
          <h2 className="text-xl font-medium mb-4">2. Descrição dos Serviços</h2>
          <p className="mb-4">
            Nossa plataforma oferece ferramentas de aprendizado e recursos para empresas e seus colaboradores. Os serviços incluem, mas não se limitam a, cursos online, materiais de aprendizado, fóruns de discussão e ferramentas de colaboração.
          </p>
          
          <h2 className="text-xl font-medium mb-4">3. Contas de Usuário</h2>
          <p className="mb-4">
            Para acessar certos recursos, você deverá criar uma conta. Você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador ou dispositivo. Você concorda em aceitar a responsabilidade por todas as atividades que ocorrem em sua conta.
          </p>
          
          <h2 className="text-xl font-medium mb-4">4. Conteúdo do Usuário</h2>
          <p className="mb-4">
            Nossa plataforma permite que você poste, vincule, armazene, compartilhe e disponibilize determinadas informações, textos, gráficos, vídeos ou outros materiais. Você é responsável pelo conteúdo que publica na plataforma.
          </p>
          
          <h2 className="text-xl font-medium mb-4">5. Propriedade Intelectual</h2>
          <p className="mb-4">
            O serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva da empresa e seus licenciadores. O serviço é protegido por direitos autorais, marcas registradas e outras leis.
          </p>
          
          <h2 className="text-xl font-medium mb-4">6. Links Para Outros Sites</h2>
          <p className="mb-4">
            Nosso serviço pode conter links para sites de terceiros que não são de propriedade ou controlados por nós. Não temos controle e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de sites ou serviços de terceiros.
          </p>
          
          <h2 className="text-xl font-medium mb-4">7. Rescisão</h2>
          <p className="mb-4">
            Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.
          </p>
          
          <h2 className="text-xl font-medium mb-4">8. Limitação de Responsabilidade</h2>
          <p className="mb-4">
            Em nenhum caso a empresa, seus diretores, funcionários ou agentes serão responsáveis por quaisquer danos indiretos, punitivos, incidentais, especiais, consequenciais ou exemplares.
          </p>
          
          <h2 className="text-xl font-medium mb-4">9. Alterações nos Termos</h2>
          <p className="mb-4">
            Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes termos a qualquer momento. É sua responsabilidade revisar estes termos periodicamente para verificar se há alterações.
          </p>
          
          <h2 className="text-xl font-medium mb-4">10. Lei Aplicável</h2>
          <p className="mb-4">
            Estes termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar seus conflitos de disposições legais.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default TermsOfUse;
