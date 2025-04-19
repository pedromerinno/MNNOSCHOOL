import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { InterestsSelector } from "./InterestsSelector";

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const { signUp } = useAuth();

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
    
    try {
      await signUp(email, password, email.split('@')[0], { interests });
      console.log("Usuario cadastrado com sucesso! Perfil será criado automaticamente.");
    } catch (error) {
      console.error("Erro no cadastro:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-medium mb-1">Criar conta</h2>
      <p className="text-sm text-gray-500 mb-8">
        Preencha os campos abaixo para começar sua jornada conosco.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-gray-500">
            Seu e-mail
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-transparent border-b border-gray-300 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-merinno-dark"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-gray-500">
            Sua senha
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-transparent border-b border-gray-300 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-merinno-dark"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm text-gray-500">
            Confirme sua senha
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-transparent border-b border-gray-300 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-merinno-dark"
          />
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">{passwordError}</p>
          )}
        </div>
        
        <InterestsSelector 
          selectedInterests={interests}
          onInterestsChange={setInterests}
        />
        
        <Button
          type="submit"
          disabled={isRegistering}
          className="w-32 h-12 rounded-full bg-merinno-dark hover:bg-black text-white"
        >
          {isRegistering ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Cadastrar"
          )}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-merinno-dark hover:underline">
            Faça login
          </Link>
        </p>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <Link to="/terms" className="hover:text-merinno-dark">
          Termos de serviço
        </Link>
        <Link to="/privacy" className="hover:text-merinno-dark">
          Política de privacidade
        </Link>
      </div>
    </div>
  );
};
