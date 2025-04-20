import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { useCache } from "@/hooks/useCache";
import { supabase } from "@/integrations/supabase/client";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      toast.error(error.message || "Falha ao fazer login com Google");
    }
  };

  if (isResetMode) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">Redefinir senha</h1>
          <p className="text-gray-600">
            Digite seu e-mail para receber as instruções de redefinição de senha
          </p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleForgotPassword(e as any);
        }} className="space-y-6">
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
            onClick={() => setIsResetMode(false)}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Button>
        </form>
      </div>
    );
  }

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
            onClick={handleGoogleLogin}
            className="w-full h-12 border border-gray-300 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
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
            onClick={() => setIsResetMode(true)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Esqueceu sua senha?
          </button>
        </div>
      </div>
    </div>
  );
};
