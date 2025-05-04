
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";

interface PasswordResetFormContentProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const PasswordResetFormContent = ({
  email,
  setEmail,
  isLoading,
  onSubmit,
}: PasswordResetFormContentProps) => {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Recuperar senha</h1>
        <p className="text-gray-600">
          Digite seu e-mail para receber as instruções de redefinição de senha
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-lg font-medium"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Enviar e-mail de redefinição"
          )}
        </Button>

        <div className="flex justify-center">
          <Link to="/login" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para o login
          </Link>
        </div>
      </form>
    </div>
  );
};
