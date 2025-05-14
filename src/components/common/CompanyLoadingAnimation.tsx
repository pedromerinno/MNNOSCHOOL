
import React from 'react';
import Lottie from 'lottie-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CompanyLoadingAnimationProps {
  isOpen: boolean;
  message?: string;
}

export const CompanyLoadingAnimation = ({ isOpen, message = "Processando..." }: CompanyLoadingAnimationProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-6">
        <div className="w-40 h-40">
          <Lottie
            animationData={require('@/assets/animations/company-loading.json')}
            loop={true}
          />
        </div>
        <p className="text-center mt-4 text-muted-foreground">{message}</p>
      </DialogContent>
    </Dialog>
  );
};
