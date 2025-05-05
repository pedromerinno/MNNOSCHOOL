
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/signup/SignupForm";

const Signup = () => {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
