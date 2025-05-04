
import { useState, useCallback } from "react";

/**
 * Handles the local state for the password reset form,
 * decoupled from UI and external logic.
 */
export const usePasswordResetFormState = () => {
  const [email, setEmail] = useState("");

  return {
    email,
    setEmail,
  };
};
