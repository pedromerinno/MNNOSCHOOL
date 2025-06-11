
import React, { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface InviteCompanySelectorProps {
  selectedCompany: Company | null;
  onCompanyChange: (companyId: string) => void;
  disabled?: boolean;
}

export const InviteCompanySelector: React.FC<InviteCompanySelectorProps> = ({
  selectedCompany,
  onCompanyChange,
  disabled = false
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  const loadCompanies = useCallback(async () => {
    if (!user?.id || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (userProfile.super_admin) {
        // Super admin sees all companies
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .order('nome')
          .limit(50);
          
        if (error) throw error;
        setCompanies(data || []);
      } else {
        // Regular admin sees only their companies
        const { data, error } = await supabase
          .rpc('get_user_companies', { user_id: user.id });
          
        if (error) throw error;
        setCompanies(data || []);
      }
    } catch (err: any) {
      console.error('Error loading companies for invite:', err);
      setError('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  }, [user?.id, userProfile]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleRetry = () => {
    loadCompanies();
  };

  if (error) {
    return (
      <div className="mb-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry} 
              className="mt-2 w-full"
              disabled={loading}
            >
              {loading ? "Carregando..." : "Tentar novamente"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Select 
      value={selectedCompany?.id || ''} 
      onValueChange={onCompanyChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Carregando empresas..." : "Selecione uma empresa"}>
          {selectedCompany && (
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-2">
                {selectedCompany.logo ? (
                  <AvatarImage 
                    src={selectedCompany.logo} 
                    alt={selectedCompany.nome}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                <AvatarFallback className="text-xs">
                  {selectedCompany.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {selectedCompany.nome}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {companies.map(company => (
          <SelectItem key={company.id} value={company.id}>
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-2">
                {company.logo ? (
                  <AvatarImage 
                    src={company.logo} 
                    alt={company.nome}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                <AvatarFallback className="text-xs">
                  {company.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {company.nome}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
