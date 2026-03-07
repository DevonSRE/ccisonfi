"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RegistrationRole = "sponsor" | "employee";

const roleOptions: { label: string; value: RegistrationRole; description: string }[] = [
  {
    label: "Sponsor",
    value: "sponsor",
    description: "Register on behalf of your team or organization.",
  },
  {
    label: "Employee",
    value: "employee",
    description: "Register yourself as an individual attendee.",
  },
];

export function RegisterStartStep() {
  const router = useRouter();
  const [role, setRole] = useState<RegistrationRole>("employee");
  const [employeeCount, setEmployeeCount] = useState("1");
  const [inputError, setInputError] = useState<string | null>(null);
  const parsedCount = Number.parseInt(employeeCount, 10);
  const isSponsorCountValid = Number.isInteger(parsedCount) && parsedCount >= 1;
  const isContinueDisabled = role === "sponsor" && !isSponsorCountValid;

  const handleContinue = () => {
    if (role === "sponsor") {
      if (!Number.isInteger(parsedCount) || parsedCount < 1) {
        setInputError("Enter a valid employee count (minimum is 1).");
        return;
      }
    }

    setInputError(null);
    const query =
      role === "sponsor"
        ? `?role=${role}&employeeCount=${parsedCount}`
        : `?role=${role}`;

    router.push(`/register${query}`);
  };

  return (
    <div className="space-y-6 pt-2 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Choose registration type</h2>
        <p className="text-sm text-slate-500 mt-1">
          Select one option below to continue.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Registration category</p>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <div
            className="w-full sm:w-auto sm:inline-grid rounded-[180px] bg-slate-100 p-1 grid grid-cols-2 gap-1"
            role="tablist"
            aria-label="Registration category"
          >
          {roleOptions.map((option) => {
            const isSelected = role === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setRole(option.value);
                  if (option.value === "employee") {
                    setEmployeeCount("1");
                  }
                  setInputError(null);
                }}
                className={`w-full sm:min-w-[180px] rounded-[180px] px-4 py-3.5 text-sm font-semibold text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-green-600 text-white"
                    : "bg-transparent text-slate-600 hover:text-slate-800"
                }`}
                role="tab"
                aria-selected={isSelected}
                aria-pressed={isSelected}
              >
                {option.label}
              </button>
            );
          })}
          </div>

          {role && (
            <p className="text-xs text-slate-500 mt-3 px-1">
              {roleOptions.find((option) => option.value === role)?.description}
            </p>
          )}
        </div>
      </div>

      {role === "sponsor" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label htmlFor="employeeCount" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Number of employees to register
          </label>
          <input
            id="employeeCount"
            name="employeeCount"
            type="number"
            min={1}
            step={1}
            value={employeeCount}
            onChange={(e) => {
              setEmployeeCount(e.target.value);
              if (inputError) {
                setInputError(null);
              }
            }}
            placeholder="e.g. 10"
            className="w-full px-4 py-5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all duration-200 outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 hover:border-slate-300"
          />
          <p className="text-xs text-slate-500 mt-2">
            This helps us prepare the right registration experience for your team.
          </p>
        </div>
      )}

      {inputError && (
        <p className="text-red-500 text-xs -mt-2">{inputError}</p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={isContinueDisabled}
        className="w-full py-4.5 px-6 rounded-lg bg-green-600 text-white font-semibold text-base hover:bg-green-700 active:bg-green-800 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Continue to Step 2
      </button>
    </div>
  );
}