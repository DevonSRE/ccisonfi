"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegistrationSuccess } from "@/components/auth/RegistrationSuccess";
import { useRegisterForm } from "@/hooks/useRegisterForm";

export default function RegisterPage() {
  const registerForm = useRegisterForm();

  return (
    <AuthLayout
      title="Create an Account"
      description="Register to join the CCISONFI community."
      hideHeader={registerForm.success}
    >
      {registerForm.success ? (
        <RegistrationSuccess onReset={registerForm.resetSuccess} />
      ) : (
        <RegisterForm registerForm={registerForm} />
      )}
    </AuthLayout>
  );
}
