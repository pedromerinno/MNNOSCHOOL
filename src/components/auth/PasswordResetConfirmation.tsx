
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

interface PasswordResetConfirmationProps {
  email: string;
}

export const PasswordResetConfirmation = ({ email }: PasswordResetConfirmationProps) => {
  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-green-500" />
        </div>
      </div>
      
      <h1 className="text-3xl font-semibold mb-2">Verifique seu e-mail</h1>
      
      <p className="text-gray-600 mb-6">
        Enviamos um link de redefinição de senha para <span className="font-medium">{email}</span>. 
        Verifique sua caixa de entrada e clique no link para criar uma nova senha.
      </p>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Não recebeu o e-mail? Verifique sua pasta de spam ou tente novamente.
        </p>
        
        <div className="flex justify-center">
          <Link to="/login" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
};
