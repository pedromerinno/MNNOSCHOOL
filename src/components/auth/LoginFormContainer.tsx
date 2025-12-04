
import { LoginFormContent } from "./LoginFormContent";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import { useLoginFormState } from "@/hooks/auth/useLoginFormState";

export const LoginFormContainer = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
  } = useLoginFormState();

  const { isLoggingIn, handleLogin } = useLoginForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <LoginFormContent
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      isLoggingIn={isLoggingIn}
      onSubmit={handleSubmit}
    />
  );
};
