"use client";

import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegistrationSuccess } from "@/components/auth/RegistrationSuccess";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { useSearchParams } from "next/navigation";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const inviteCode = searchParams.get("invite");
  const registrationType = roleParam === "sponsor" ? "sponsor" : "employee";

  const registerForm = useRegisterForm({
    registrationType,
    inviteCode,
  });

  return (
    <AuthLayout
      title="Kindly fill the form below to register"
      description="Complete your registration to attend the CCISONFI Conference 2026."
      hideHeader={registerForm.success}
    >
      {registerForm.success ? (
        <RegistrationSuccess
          onReset={registerForm.resetSuccess}
          shareLink={registerForm.shareLink}
          registrationType={registerForm.registrationType}
        />
      ) : (
        <RegisterForm registerForm={registerForm} />
      )}
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout
          title="Kindly fill the form below to register"
          description="Complete your registration to attend the CCISONFI Conference 2026."
        >
          <div className="py-8 text-sm text-slate-500">Loading registration form...</div>
        </AuthLayout>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
