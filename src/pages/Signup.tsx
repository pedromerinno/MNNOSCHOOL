
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/signup/SignupForm";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  console.log("Signup page rendering");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      console.log("Usuário já autenticado, redirecionando para home");
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
