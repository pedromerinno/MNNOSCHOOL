
import { useState } from "react";
import { PasswordResetFormContent } from "./PasswordResetFormContent";
import { PasswordResetConfirmation } from "./PasswordResetConfirmation";
import { usePasswordResetFormState } from "@/hooks/auth/usePasswordResetFormState";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const PasswordResetFormContainer = () => {
  const { email, setEmail } = usePasswordResetFormState();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu e-mail para redefinir a senha");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });
      
      if (error) throw error;
      
      setIsEmailSent(true);
      toast.success("Um e-mail de redefinição de senha foi enviado para você");
    } catch (error: any) {
      console.error("Erro ao resetar senha:", error);
      toast.error(error.message || "Falha ao enviar e-mail de redefinição");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return <PasswordResetConfirmation email={email} />;
  }

  return (
    <PasswordResetFormContent 
      email={email}
      setEmail={setEmail}
      isLoading={isLoading}
      onSubmit={handleSubmit}
    />
  );
};
