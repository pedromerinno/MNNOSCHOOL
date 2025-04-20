
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PasswordResetFormProps {
  email: string;
  setEmail: (email: string) => void;
  onBack: () => void;
}

export const PasswordResetForm = ({ email, setEmail, onBack }: PasswordResetFormProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu e-mail para redefinir a senha");
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Um e-mail de redefinição de senha foi enviado para você");
    } catch (error: any) {
      console.error("Erro ao resetar senha:", error);
      toast.error(error.message || "Falha ao enviar e-mail de redefinição");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Redefinir senha</h1>
        <p className="text-gray-600">
          Digite seu e-mail para receber as instruções de redefinição de senha
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-lg font-medium"
        >
          Enviar e-mail de redefinição
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Button>
      </form>
    </div>
  );
};
