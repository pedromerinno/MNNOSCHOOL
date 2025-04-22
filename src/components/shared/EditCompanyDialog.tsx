
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyIntegrationForm } from '@/components/admin/integration/CompanyIntegrationForm';
import { Company } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";

interface EditCompanyDialogProps {
  company: Company | null;
}

export const EditCompanyDialog = ({ company }: EditCompanyDialogProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  if (!isAdmin || !company) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="h-4 w-4" />
        Editar Empresa
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar {company.nome}</DialogTitle>
          </DialogHeader>
          
          <CompanyIntegrationForm
            company={company}
            onSubmit={async (data) => {
              try {
                const event = new CustomEvent('company-updated', {
                  detail: { company: { ...company, ...data } }
                });
                window.dispatchEvent(event);
                setIsOpen(false);
              } catch (error) {
                console.error('Error updating company:', error);
              }
            }}
            isSaving={false}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
