import { Icons } from "@/components/ui/Icons";

interface RegistrationSuccessProps {
  onReset: () => void;
}

export function RegistrationSuccess({ onReset }: RegistrationSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
        <Icons.CheckCircle2 className="w-8 h-8 text-green-600" />
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
