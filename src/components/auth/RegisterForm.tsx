"use client";

import { Icons } from "@/components/ui/Icons";
import type { useRegisterForm } from "@/hooks/useRegisterForm";

const inputClasses =
  "w-full px-4 py-5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all duration-200 outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 hover:border-slate-300";

const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

const errorInputClasses = "border-red-400 focus:ring-red-500 focus:border-red-500";

interface RegisterFormProps {
  registerForm: ReturnType<typeof useRegisterForm>;
}

export function RegisterForm({ registerForm }: RegisterFormProps) {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    handleChange,
    handleSubmit,
  } = registerForm;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2 pb-8">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
          <Icons.AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClasses}>
            First Name
          </label>
          <div className="relative">
            <Icons.User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className={`${inputClasses} pl-10 ${fieldErrors.firstName ? errorInputClasses : ""}`}
            />
          </div>
          {fieldErrors.firstName && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className={labelClasses}>
            Last Name
          </label>
          <div className="relative">
            <Icons.User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className={`${inputClasses} pl-10 ${fieldErrors.lastName ? errorInputClasses : ""}`}
            />
          </div>
          {fieldErrors.lastName && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className={labelClasses}>
          Gender
        </label>
        <div className="relative">
          <select
            id="gender"
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
            className={`${inputClasses} appearance-none cursor-pointer ${fieldErrors.gender ? errorInputClasses : ""}`}
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Prefer not to say</option>
          </select>
          <Icons.ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {fieldErrors.gender && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.gender}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClasses}>
          Email Address
        </label>
        <div className="relative">
          <Icons.Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="emmanuel@gmail.com"
            className={`${inputClasses} pl-10 ${fieldErrors.email ? errorInputClasses : ""}`}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className={labelClasses}>
          Phone Number
        </label>
        <div className="relative">
          <Icons.Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
            className={`${inputClasses} pl-10 ${fieldErrors.phone ? errorInputClasses : ""}`}
          />
        </div>
        {fieldErrors.phone && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
        )}
      </div>

      {/* Organisation & Designation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="organisation" className={labelClasses}>
            Organisation
          </label>
          <div className="relative">
            <Icons.Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="organisation"
              name="organisation"
              type="text"
              required
              value={formData.organisation}
              onChange={handleChange}
              placeholder="Your organisation"
              className={`${inputClasses} pl-10 ${fieldErrors.organisation ? errorInputClasses : ""}`}
            />
          </div>
          {fieldErrors.organisation && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.organisation}</p>
          )}
        </div>

        <div>
          <label htmlFor="designation" className={labelClasses}>
            Designation
          </label>
          <div className="relative">
            <Icons.Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="designation"
              name="designation"
              type="text"
              required
              value={formData.designation}
              onChange={handleChange}
              placeholder="Your role / title"
              className={`${inputClasses} pl-10 ${fieldErrors.designation ? errorInputClasses : ""}`}
            />
          </div>
          {fieldErrors.designation && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.designation}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 active:bg-green-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Icons.Loader2 className="w-4 h-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <p className="text-center text-xs text-slate-400 pt-2">
        By registering, you agree to our{" "}
        <a href="#" className="text-green-600 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-green-600 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
