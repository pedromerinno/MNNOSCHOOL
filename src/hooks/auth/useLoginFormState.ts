
import { useState, useCallback } from "react";

/**
 * Handles the local state for the login form,
 * decoupled from UI and external logic.
 */
export const useLoginFormState = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);

  const switchToResetMode = useCallback(() => setIsResetMode(true), []);
  const switchToLoginMode = useCallback(() => setIsResetMode(false), []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isResetMode,
    switchToResetMode,
    switchToLoginMode,
  };
};
