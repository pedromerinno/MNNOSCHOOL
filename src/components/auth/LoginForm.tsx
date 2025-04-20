
import { useState } from "react";
import { LoginFormContent } from "./LoginFormContent";
import { PasswordResetForm } from "./PasswordResetForm";
import { useLoginForm } from "@/hooks/auth/useLoginForm";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const { isLoggingIn, handleLogin } = useLoginForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  if (isResetMode) {
    return (
      <PasswordResetForm
        email={email}
        setEmail={setEmail}
        onBack={() => setIsResetMode(false)}
      />
    );
  }

  return (
    <LoginFormContent
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      isLoggingIn={isLoggingIn}
      onSubmit={handleSubmit}
      onForgotPassword={() => setIsResetMode(true)}
    />
  );
};
