
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
    
    setIsRegistering(true);
    setSignupError(null);
    setEmailAlreadyRegistered(false);
    
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
        
        // Verificar se o e-mail já está cadastrado
        if (result.emailAlreadyRegistered) {
          setEmailAlreadyRegistered(true);
          // Não redirecionar para a tela de confirmação de e-mail se o e-mail já estiver cadastrado
          toast.error("Este e-mail já está cadastrado. Por favor, faça login.");
        }
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
      } else if (result.error?.code === 'email_already_registered') {
        setEmailAlreadyRegistered(true);
        toast.error("Este e-mail já está cadastrado. Por favor, faça login.");
      }
    } finally {
      setIsResending(false);
    }
  };

  // Se o cadastro foi bem-sucedido, requer confirmação de e-mail E o e-mail NÃO está já registrado
  // então mostrar a tela de confirmação de e-mail
  if (isSuccess && needsEmailConfirmation && !emailAlreadyRegistered) {
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
      />
    </div>
  );
};
