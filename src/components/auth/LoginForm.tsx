
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would handle authentication here
    console.log("Login attempt with:", { email, password, rememberMe });
    // For demo purposes, redirect to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-medium mb-1">Bem-vindo(a)</h2>
      <p className="text-sm text-gray-500 mb-8">
        Preencha os campos a baixo para entrar no universo que construímos cuidadosamente para você.
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => 
                setRememberMe(checked === true ? true : false)
              }
              className="rounded-sm data-[state=checked]:bg-merinno-dark"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              lembrar meu usuário
            </label>
          </div>
          
          <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-merinno-dark">
            esqueci minha senha
          </Link>
        </div>
        
        <Button
          type="submit"
          className="w-32 h-12 rounded-full bg-merinno-dark hover:bg-black text-white"
        >
          Acessar
        </Button>
      </form>
      
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
