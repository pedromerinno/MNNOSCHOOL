
import { LoginFormContent } from "./LoginFormContent";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import { useLoginFormState } from "@/hooks/auth/useLoginFormState";
import { useNavigate } from "react-router-dom";

export const LoginFormContainer = () => {
  const navigate = useNavigate();
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

  const handleForgotPassword = () => {
    navigate("/password-reset");
  };

  return (
    <LoginFormContent
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      isLoggingIn={isLoggingIn}
      onSubmit={handleSubmit}
      onForgotPassword={handleForgotPassword}
    />
  );
};
