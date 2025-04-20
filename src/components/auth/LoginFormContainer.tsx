
import { LoginFormContent } from "./LoginFormContent";
import { PasswordResetForm } from "./PasswordResetForm";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import { useLoginFormState } from "@/hooks/auth/useLoginFormState";

export const LoginFormContainer = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isResetMode,
    switchToResetMode,
    switchToLoginMode,
  } = useLoginFormState();

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
        onBack={switchToLoginMode}
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
      onForgotPassword={switchToResetMode}
    />
  );
};
