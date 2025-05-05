
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, RefreshCw, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [signupError, setSignupError] = useState<{message: string, code: string} | null>(null);
  const [emailResent, setEmailResent] = useState(false);
  const { signUp, resendConfirmationEmail } = useAuth();

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    
    setPasswordError("");
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsRegistering(true);
    setSignupError(null);
    
    try {
      const metadataWithCompany = { 
        interests: ["onboarding_incomplete"] 
      };
      
      const displayName = email.split('@')[0];
      
      console.log("Iniciando cadastro com metadata:", metadataWithCompany);
      const result = await signUp(email, password, displayName, metadataWithCompany);
      
      if (result.success) {
        if (result.needsEmailConfirmation) {
          console.log("Cadastro feito com sucesso! Email de confirmação enviado.");
          setNeedsEmailConfirmation(true);
          setIsSuccess(true);
        } else {
          console.log("Cadastro realizado com sucesso e sessão iniciada!");
          // Navegação feita pelo useAuthMethods
        }
      } else {
        console.error("Erro no cadastro:", result.error);
        setSignupError(result.error);
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setEmailResent(false);
    try {
      const result = await resendConfirmationEmail(email);
      if (result.success) {
        setEmailResent(true);
        setTimeout(() => {
          setEmailResent(false);
        }, 5000); // Reset after 5 seconds
      }
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess && needsEmailConfirmation) {
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
            onClick={handleResendEmail}
            disabled={isResending}
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
        
        <p className="text-gray-600">
          Já confirmou seu e-mail?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Faça login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Criar conta</h1>
        <p className="text-gray-600">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Faça login
          </Link>
        </p>
      </div>
      
      {signupError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{signupError.message}</AlertDescription>
        </Alert>
      )}
      
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
        
        <div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua senha"
            required
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">{passwordError}</p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isRegistering}
          className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-lg font-medium"
        >
          {isRegistering ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Cadastrar"
          )}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OU</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Button 
            variant="outline"
            className="w-full h-12 border border-gray-300 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            Entrar com Google
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-12 border border-gray-300 rounded-lg font-medium"
          >
            Usar Single Sign-On (SSO)
          </Button>
        </div>

        <div className="mt-4 text-xs text-center text-gray-500 px-4">
          Ao clicar em "Cadastrar", "Entrar com Google" ou "Usar Single Sign-On (SSO)", 
          você concorda com nossos <Link to="/termos" className="underline hover:text-blue-600">Termos de Uso</Link> e 
          reconhece que leu e compreendeu nossa <Link to="/privacidade" className="underline hover:text-blue-600">Política de Privacidade</Link>.
        </div>
      </div>
    </div>
  );
};
