"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegistrationSuccess } from "@/components/auth/RegistrationSuccess";
import { useRegisterForm } from "@/hooks/useRegisterForm";

export default function RegisterPage() {
  const registerForm = useRegisterForm();

  return (
    <AuthLayout
      title="Kindly fill the form below to register"
      description="Complete your registration to attend the CCISONFI Conference 2026."
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
