
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, Mail, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

interface EmailConfirmationViewProps {
  email: string;
  isResending: boolean;
  emailResent: boolean;
  emailAlreadyRegistered: boolean;
  onResendEmail: () => void;
}

export const EmailConfirmationView: React.FC<EmailConfirmationViewProps> = ({
  email,
  isResending,
  emailResent,
  emailAlreadyRegistered,
  onResendEmail,
}) => {
  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h1 className="text-3xl font-semibold mb-4">Verifique seu e-mail</h1>
      <p className="text-gray-600 mb-6">
        Enviamos um link de confirmação para <span className="font-medium">{email}</span>. 
        Por favor, verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
      </p>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <p className="text-sm text-gray-500">
          Se você não encontrar o e-mail na caixa de entrada, verifique também sua pasta de spam ou lixo eletrônico.
        </p>
      </div>
      
      {emailResent ? (
        <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-md flex items-center gap-2 justify-center text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span>E-mail de confirmação reenviado com sucesso!</span>
        </div>
      ) : (
        <Button 
          onClick={onResendEmail}
          disabled={isResending || emailAlreadyRegistered}
          variant="outline"
          className="mb-6 flex items-center gap-2 w-full justify-center"
        >
          {isResending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Reenviar e-mail de confirmação
            </>
          )}
        </Button>
      )}
      
      {emailAlreadyRegistered && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-md flex items-center gap-2 justify-center text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          <span>Este e-mail já está cadastrado. Por favor, faça login.</span>
        </div>
      )}
      
      <p className="text-gray-600">
        Já confirmou seu e-mail?{" "}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Faça login
        </Link>
      </p>
    </div>
  );
};
