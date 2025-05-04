
import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordResetFormContainer } from "@/components/auth/PasswordResetFormContainer";

const PasswordReset = () => {
  console.log("Password Reset page rendering");
  return (
    <AuthLayout>
      <PasswordResetFormContainer />
    </AuthLayout>
  );
};

export default PasswordReset;
