import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building, Plus, Link, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
interface CompanySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
  onCompanyCreated: () => void;
  userId?: string;
  forceGetUserCompanies?: (userId: string) => Promise<any>;
}
export const CompanySelectionDialog: React.FC<CompanySelectionDialogProps> = ({
  open,
  onOpenChange,
  onCompanyTypeSelect,
  onCompanyCreated,
  userId,
  forceGetUserCompanies
}) => {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 max-h-[90vh] h-auto overflow-hidden flex flex-col">
        <div className="bg-white dark:bg-gray-900 rounded-t-lg flex-1 overflow-auto">
          <div className="p-6 md:p-16">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold text-center py-[10px]">
                Configuração da Empresa
              </DialogTitle>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-0">
                Escolha entre criar uma nova empresa ou vincular-se a uma existente
              </p>
            </DialogHeader>

            <OnboardingProvider>
              <CompanyStep onNext={() => {
              console.log("[CompanySelectionDialog] CompanyStep onNext called");
              onOpenChange(false);
              if (userId && forceGetUserCompanies) {
                forceGetUserCompanies(userId);
              }
              onCompanyCreated();
            }} onBack={() => onOpenChange(false)} onCompanyTypeSelect={onCompanyTypeSelect} onCompanyCreated={onCompanyCreated} showBackButton={false} />
            </OnboardingProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};