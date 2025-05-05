
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SignupErrorAlertsProps {
  signupError: { message: string; code: string } | null;
  emailAlreadyRegistered: boolean;
}

export const SignupErrorAlerts: React.FC<SignupErrorAlertsProps> = ({
  signupError,
  emailAlreadyRegistered,
}) => {
  if (!signupError && !emailAlreadyRegistered) return null;
  
  return (
    <>
      {signupError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{signupError.message}</AlertDescription>
        </Alert>
      )}
      
      {emailAlreadyRegistered && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Este e-mail já está cadastrado. Por favor, faça login.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
