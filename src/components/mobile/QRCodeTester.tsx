
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Smartphone, Copy, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";

export const QRCodeTester = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // URL da aplicação Lovable
  const appUrl = "https://5cae13a1-92c0-4c6b-93bc-bb999597eb98.lovableproject.com?forceHideBadge=true";
  
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success('URL copiada para área de transferência'))
      .catch(() => toast.error('Falha ao copiar URL'));
  };

  const openInBrowser = () => {
    window.open(appUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 lg:hidden"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          Testar no Mobile
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Testar no iPhone
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
              <QRCodeSVG 
                value={appUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">📱 Opção 1: Safari (PWA)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Escaneie o QR Code com a câmera do iPhone e abra no Safari. 
                Adicione à tela inicial para uma experiência como app nativo.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(appUrl)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar URL
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openInBrowser}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Opção 2: App Nativo (Capacitor)
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Para ter um app nativo de verdade no iPhone:
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>1.</strong> Exporte o projeto para GitHub (botão no topo)
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>2.</strong> Faça git pull do projeto
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>3.</strong> Execute: <code className="bg-white/50 px-1 rounded">npm install</code>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>4.</strong> Execute: <code className="bg-white/50 px-1 rounded">npx cap init</code>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>5.</strong> Execute: <code className="bg-white/50 px-1 rounded">npx cap add ios</code>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>6.</strong> Execute: <code className="bg-white/50 px-1 rounded">npm run build && npx cap sync</code>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>7.</strong> Execute: <code className="bg-white/50 px-1 rounded">npx cap run ios</code>
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">🚀 Opção 3: Expo Go</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Baixe o app "Expo Go" na App Store, depois escaneie o QR Code acima.
              </p>
              <a 
                href="https://apps.apple.com/app/expo-go/id982107779"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Baixar Expo Go →
              </a>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-xs text-green-700 dark:text-green-300">
              💡 <strong>Dica:</strong> O Capacitor já está configurado no projeto! 
              Siga as instruções da Opção 2 para ter um app iOS nativo completo.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
