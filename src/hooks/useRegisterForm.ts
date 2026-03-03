"use client";

import { useState } from "react";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  organisation: string;
  designation: string;
}

export type FieldErrors = Partial<Record<keyof RegisterFormData, string>>;

const initialFormData: RegisterFormData = {
  firstName: "",
  lastName: "",
  gender: "",
  email: "",
  phone: "",
  organisation: "",
  designation: "",
};

export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof RegisterFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    // Client-side Zod validation
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.errors.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as keyof RegisterFormData;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSuccess = () => setSuccess(false);

  return {
    formData,
    isSubmitting,
    success,
    error,
    fieldErrors,
    handleChange,
    handleSubmit,
    resetSuccess,
  };
}
