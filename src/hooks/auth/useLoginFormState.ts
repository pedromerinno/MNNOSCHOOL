
import { useState } from "react";

/**
 * Handles the local state for the login form,
 * decoupled from UI and external logic.
 */
export const useLoginFormState = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return {
    email,
    setEmail,
    password,
    setPassword
  };
};
