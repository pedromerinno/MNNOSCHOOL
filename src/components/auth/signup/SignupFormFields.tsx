
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface SignupFormFieldsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  passwordError: string;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isRegistering: boolean;
}

export const SignupFormFields: React.FC<SignupFormFieldsProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  handleSubmit,
  isRegistering,
}) => {
  return (
    <>
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
    </>
  );
};
