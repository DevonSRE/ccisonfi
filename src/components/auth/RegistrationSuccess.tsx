"use client";

import dynamic from "next/dynamic";
import profileAnimation from "../../../public/Profile.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface RegistrationSuccessProps {
  onReset: () => void;
}

export function RegistrationSuccess({ onReset }: RegistrationSuccessProps) {
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
      <button
        onClick={onReset}
        className="mt-4 text-green-600 font-semibold hover:text-green-700 transition-colors underline underline-offset-4"
      >
        Register another person
      </button>
    </div>
  );
}
