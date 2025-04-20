import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Github } from "lucide-react";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { useCache } from "@/hooks/useCache";
import { supabase } from "@/integrations/supabase/client";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();
  const { getUserCompanies, selectCompany } = useCompanies();
  const { clearCache } = useCache();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      clearCache('userCompanies');
      clearCache('selectedCompany');
      clearCache('selectedCompanyId');
      
      const { data, error } = await signInWithPassword(email, password);
      if (error) throw error;

      if (data && data.session && data.session.user) {
        const companies = await getUserCompanies(data.session.user.id, true);
        if (companies && companies.length > 0) {
          await selectCompany(data.session.user.id, companies[0]);
          toast.success("Login realizado com sucesso!");
        } else {
          toast.error("Nenhuma empresa disponível para este usuário");
        }
      }

      navigate('/');
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(error.message || "Falha ao fazer login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
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
        <h1 className="text-3xl font-semibold mb-2">Bem-vindo(a) de volta</h1>
        <p className="text-gray-600">
          Não tem uma conta?{" "}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Usuário ou E-mail"
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
        
        <Button
          type="submit"
          disabled={isLoggingIn}
          className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-lg font-medium"
        >
          {isLoggingIn ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Entrar"
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
            <Github className="h-5 w-5" />
            Entrar com GitHub
          </Button>
          
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

        <div className="mt-6 text-center">
          <button 
            onClick={handleForgotPassword}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Esqueceu sua senha?
          </button>
        </div>
      </div>
    </div>
  );
};
