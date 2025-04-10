
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Loader2 } from "lucide-react";

const UserOnboarding = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Check if user is already onboarded (has display name set)
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // If user already has a display name, redirect to dashboard
    if (userProfile?.displayName) {
      navigate("/");
    } else {
      setLoading(false);
    }
  }, [user, userProfile, navigate]);
  
  if (loading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-merinno-dark" />
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout>
      <OnboardingForm />
    </AuthLayout>
  );
};

export default UserOnboarding;
