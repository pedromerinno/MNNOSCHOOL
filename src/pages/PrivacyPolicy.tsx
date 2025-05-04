
import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
        
        <h1 className="text-3xl font-semibold mb-6">Política de Privacidade</h1>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-medium mb-4">1. Informações que Coletamos</h2>
          <p className="mb-4">
            Coletamos diferentes tipos de informações para diversas finalidades com o objetivo de fornecer e melhorar nossos serviços para você.
          </p>
          <h3 className="text-lg font-medium mb-2">1.1 Dados Pessoais</h3>
          <p className="mb-4">
            Ao usar nosso serviço, podemos solicitar que você nos forneça certas informações de identificação pessoal que podem ser usadas para contatá-lo ou identificá-lo ("Dados Pessoais"). Informações de identificação pessoal podem incluir, mas não se limitam a:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Endereço de e-mail</li>
            <li>Nome e sobrenome</li>
            <li>Informações de perfil profissional</li>
            <li>Cookies e dados de uso</li>
          </ul>
          
          <h2 className="text-xl font-medium mb-4">2. Uso dos Dados</h2>
          <p className="mb-4">
            Usamos os dados coletados para diversos fins:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Para fornecer e manter nosso serviço</li>
            <li>Para notificá-lo sobre mudanças em nosso serviço</li>
            <li>Para permitir que você participe de recursos interativos de nosso serviço</li>
            <li>Para fornecer suporte ao cliente</li>
            <li>Para coletar análises ou informações valiosas para que possamos melhorar nosso serviço</li>
            <li>Para monitorar o uso de nosso serviço</li>
            <li>Para detectar, prevenir e resolver problemas técnicos</li>
          </ul>
          
          <h2 className="text-xl font-medium mb-4">3. Transferência de Dados</h2>
          <p className="mb-4">
            Suas informações, incluindo Dados Pessoais, podem ser transferidas para — e mantidas em — computadores localizados fora de seu estado, província, país ou outra jurisdição governamental onde as leis de proteção de dados podem ser diferentes das de sua jurisdição.
          </p>
          
          <h2 className="text-xl font-medium mb-4">4. Divulgação de Dados</h2>
          <p className="mb-4">
            Podemos divulgar seus Dados Pessoais se acreditarmos de boa fé que tal ação é necessária para:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Cumprir uma obrigação legal</li>
            <li>Proteger e defender os direitos ou propriedade da empresa</li>
            <li>Prevenir ou investigar possíveis irregularidades em relação ao serviço</li>
            <li>Proteger a segurança pessoal dos usuários do serviço ou do público</li>
            <li>Proteger contra responsabilidade legal</li>
          </ul>
          
          <h2 className="text-xl font-medium mb-4">5. Segurança de Dados</h2>
          <p className="mb-4">
            A segurança de seus dados é importante para nós, mas lembre-se de que nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro. Embora nos esforcemos para usar meios comercialmente aceitáveis para proteger seus Dados Pessoais, não podemos garantir sua segurança absoluta.
          </p>
          
          <h2 className="text-xl font-medium mb-4">6. Seus Direitos de Proteção de Dados</h2>
          <p className="mb-4">
            Você tem certos direitos de proteção de dados. Nosso objetivo é tomar medidas razoáveis para permitir que você corrija, altere, exclua ou limite o uso de seus Dados Pessoais.
          </p>
          
          <h2 className="text-xl font-medium mb-4">7. Alterações a Esta Política de Privacidade</h2>
          <p className="mb-4">
            Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página.
          </p>
          
          <h2 className="text-xl font-medium mb-4">8. Contate-nos</h2>
          <p className="mb-4">
            Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Por e-mail: contato@empresa.com</li>
          </ul>
        </div>
      </div>
    </AuthLayout>
  );
};

export default PrivacyPolicy;
