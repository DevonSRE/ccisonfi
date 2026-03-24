"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { trackEvent } from "@/lib/analytics";
import profileAnimation from "../../../public/Profile.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface RegistrationSuccessProps {
  onReset: () => void;
  shareLink?: string | null;
  registrationType?: "sponsor" | "attendee";
}

export function RegistrationSuccess({
  onReset,
  shareLink,
  registrationType,
}: RegistrationSuccessProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    trackEvent("registration_complete", {
      registration_type: registrationType ?? null,
      has_share_link: Boolean(shareLink),
    });
  }, [registrationType, shareLink]);

  const handleCopy = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2500);
    } catch {
      setCopyStatus("failed");
      setTimeout(() => setCopyStatus("idle"), 2500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-5 text-center">
      <div className="w-28 h-28">
        <Lottie
          animationData={profileAnimation}
          loop={false}
          className="w-full h-full"
        />
      </div>
      <h3 className="text-2xl font-bold text-slate-900">
        Registration Successful!
      </h3>
      <p className="text-slate-500 max-w-sm">
        Thank you for registering with CCISONFI. We&apos;ll be in touch with
        you shortly.
      </p>

      {registrationType === "sponsor" && shareLink && (
        <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 sm:p-5 text-left shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-1">Organization invitation link generated</p>
          <p className="text-xs text-slate-500 mb-3">
            Share this link only with attendees/participants from your organisation. Their organisation field will be auto-filled.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 active:bg-green-800 transition-colors min-w-[120px]"
            >
              <Icons.Copy className="h-4 w-4" />
              {copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Try again" : "Copy link"}
            </button>
          </div>
          {copyStatus === "failed" && (
            <p className="text-xs text-red-500 mt-2">Could not copy link automatically. Please copy it manually.</p>
          )}
        </div>
      )}

      <button
        onClick={onReset}
        className="mt-4 text-green-600 font-semibold hover:text-green-700 transition-colors underline underline-offset-4"
      >
        Register another person
      </button>
    </div>
  );
}
