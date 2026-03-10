"use client";

import { useEffect, useMemo, useState } from "react";
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

type RegistrationType = "sponsor" | "attendee";

interface UseRegisterFormOptions {
  registrationType?: RegistrationType;
  inviteCode?: string | null;
  sponsorshipCategory?: string | null;
  staffCount?: number;
}

const initialFormData: RegisterFormData = {
  firstName: "",
  lastName: "",
  gender: "",
  email: "",
  phone: "",
  organisation: "",
  designation: "",
};

export function useRegisterForm(options?: UseRegisterFormOptions) {
  const registrationType = options?.registrationType ?? "attendee";
  const inviteCode = options?.inviteCode ?? null;
  const sponsorshipCategory = options?.sponsorshipCategory?.trim() || undefined;
  const staffCount =
    typeof options?.staffCount === "number" && Number.isInteger(options.staffCount) && options.staffCount >= 1
      ? options.staffCount
      : undefined;

  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [inviteLookupLoading, setInviteLookupLoading] = useState(false);
  const [organisationLocked, setOrganisationLocked] = useState(false);

  const isInviteAttendeeFlow = useMemo(
    () => registrationType === "attendee" && Boolean(inviteCode),
    [registrationType, inviteCode]
  );

  useEffect(() => {
    let active = true;

    const resolveInvite = async () => {
      if (!isInviteAttendeeFlow || !inviteCode) {
        if (active) {
          setOrganisationLocked(false);
        }
        return;
      }

      setInviteLookupLoading(true);
      try {
        const response = await fetch(
          `/api/register/invite?code=${encodeURIComponent(inviteCode)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Invalid invite link");
        }

        if (!active) return;

        setFormData((prev) => ({
          ...prev,
          organisation: data.organisation ?? prev.organisation,
        }));
        setOrganisationLocked(true);
        setError(null);
      } catch (err) {
        if (!active) return;
        setOrganisationLocked(false);
        setError(err instanceof Error ? err.message : "Invalid invite link");
      } finally {
        if (active) {
          setInviteLookupLoading(false);
        }
      }
    };

    resolveInvite();

    return () => {
      active = false;
    };
  }, [inviteCode, isInviteAttendeeFlow]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "organisation" && organisationLocked) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof RegisterFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const setFieldValue = (name: keyof RegisterFormData, value: string) => {
    if (name === "organisation" && organisationLocked) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    setShareLink(null);

    if (isInviteAttendeeFlow && !organisationLocked) {
      setError("Your invite link could not be validated. Please use a valid link.");
      setIsSubmitting(false);
      return;
    }

    // Client-side Zod validation
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
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
        body: JSON.stringify({
          ...formData,
          registrationType,
          inviteCode: isInviteAttendeeFlow ? inviteCode ?? undefined : undefined,
          sponsorshipCategory: registrationType === "sponsor" ? sponsorshipCategory : undefined,
          staffCount: registrationType === "sponsor" ? staffCount : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setShareLink(data.shareLink ?? null);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSuccess = () => {
    setSuccess(false);
    setShareLink(null);
  };

  return {
    formData,
    isSubmitting,
    success,
    error,
    fieldErrors,
    shareLink,
    inviteLookupLoading,
    organisationLocked,
    registrationType,
    handleChange,
    setFieldValue,
    handleSubmit,
    resetSuccess,
  };
}
