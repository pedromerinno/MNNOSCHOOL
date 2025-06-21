
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { SignupErrorAlerts } from "./SignupErrorAlerts";
import { EmailConfirmationView } from "./EmailConfirmationView";
import { SignupFormFields } from "./SignupFormFields";
import { toast } from "sonner";

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
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
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
    
    // Reset all state flags before starting the signup process
    setIsRegistering(true);
    setSignupError(null);
    setEmailAlreadyRegistered(false);
    setNeedsEmailConfirmation(false);
    setIsSuccess(false);
    
    try {
      const displayName = email.split('@')[0];
      
      console.log("Iniciando cadastro com detecção automática de convites");
      const result = await signUp(email, password, displayName);
      
      console.log("Resultado do cadastro:", result);
      
      if (result.success) {
        if (result.needsEmailConfirmation) {
          console.log("Cadastro feito com sucesso! Email de confirmação enviado.");
          setNeedsEmailConfirmation(true);
          setIsSuccess(true);
          setEmailAlreadyRegistered(false);
          
          toast.success("Cadastro realizado! Verifique seu email para confirmar a conta.");
        } else {
          console.log("Cadastro realizado com sucesso e sessão iniciada!");
          toast.success("Cadastro realizado com sucesso! Verificando vinculação com empresa...");
          // Navegação e detecção de convites feita pelo useAuth
        }
      } else {
        console.error("Erro no cadastro:", result.error);
        setSignupError(result.error);
        setIsSuccess(false);
        setNeedsEmailConfirmation(false);
        
        // Verificar explicitamente se o e-mail já está cadastrado
        if (result.emailAlreadyRegistered || (result.error?.code === 'email_already_registered')) {
          console.log("Email já registrado detectado!");
          setEmailAlreadyRegistered(true);
          toast.error("Este e-mail já está cadastrado. Por favor, faça login.");
        } else {
          toast.error(result.error?.message || "Erro no cadastro. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      setIsSuccess(false);
      setNeedsEmailConfirmation(false);
      toast.error("Erro inesperado no cadastro. Tente novamente.");
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
      console.log("Resultado do reenvio:", result);
      
      if (result.success) {
        setEmailResent(true);
        toast.success("Email de confirmação reenviado!");
        setTimeout(() => {
          setEmailResent(false);
        }, 5000);
      } else if (result.error?.code === 'email_already_registered') {
        setEmailAlreadyRegistered(true);
        setNeedsEmailConfirmation(false);
        setIsSuccess(false);
        toast.error("Este e-mail já está cadastrado. Por favor, faça login.");
      } else {
        toast.error("Erro ao reenviar email. Tente novamente.");
      }
    } finally {
      setIsResending(false);
    }
  };

  // Lógica de renderização condicional
  console.log("Estado atual:", { 
    isSuccess, 
    needsEmailConfirmation, 
    emailAlreadyRegistered,
    signupError
  });

  // APENAS mostrar a tela de confirmação se todas estas condições forem verdadeiras
  if (isSuccess && needsEmailConfirmation && !emailAlreadyRegistered) {
    console.log("Mostrando tela de confirmação de email");
    return (
      <EmailConfirmationView
        email={email}
        isResending={isResending}
        emailResent={emailResent}
        emailAlreadyRegistered={emailAlreadyRegistered}
        onResendEmail={handleResendEmail}
      />
    );
  }

  // Formulário principal de registro
  console.log("Mostrando formulário de cadastro");
  return (
    <div className="w-full max-w-sm mx-auto px-2 sm:px-0">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Criar conta</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Faça login
          </Link>
        </p>
      </div>
      
      <SignupErrorAlerts
        signupError={signupError}
        emailAlreadyRegistered={emailAlreadyRegistered}
      />
      
      <SignupFormFields
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        passwordError={passwordError}
        handleSubmit={handleSubmit}
        isRegistering={isRegistering}
        emailAlreadyRegistered={emailAlreadyRegistered}
      />
    </div>
  );
};
