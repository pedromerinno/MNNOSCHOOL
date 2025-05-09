
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

const Onboarding = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home page, as we're now handling onboarding via dialogs
    navigate("/", { replace: true });
  }, [navigate]);
  
  return <Navigate to="/" replace />;
};

export default Onboarding;
