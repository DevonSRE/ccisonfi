"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/Icons";

type RegistrationRole = "sponsor" | "attendee";

const sponsorshipCategories = [
  "Silver",
  "Gold",
  "Platinum",
] as const;

const roleOptions: { label: string; value: RegistrationRole; description: string }[] = [
  {
    label: "Sponsor",
    value: "sponsor",
    description: "Register on behalf of your team or organization.",
  },
  {
    label: "Attendee",
    value: "attendee",
    description: "Register yourself as an individual attendee or participant.",
  },
];

export function RegisterStartStep() {
  const router = useRouter();
  const [role, setRole] = useState<RegistrationRole>("attendee");
  const [staffCount, setStaffCount] = useState("1");
  const [sponsorshipCategory, setSponsorshipCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const parsedCount = Number.parseInt(staffCount, 10);
  const isSponsorCountValid = Number.isInteger(parsedCount) && parsedCount >= 1;
  const isContinueDisabled =
    role === "sponsor" && (!sponsorshipCategory || !isSponsorCountValid);

  const handleContinue = () => {
    if (role === "sponsor") {
      if (!sponsorshipCategory) {
        setInputError("Select a sponsorship category.");
        return;
      }

      if (!Number.isInteger(parsedCount) || parsedCount < 1) {
        setInputError("Enter a valid number of staff (minimum is 1).");
        return;
      }
    }

    setInputError(null);
    const query =
      role === "sponsor"
        ? `?role=${role}&sponsorshipCategory=${encodeURIComponent(sponsorshipCategory)}&staffCount=${parsedCount}`
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
            className="w-full sm:w-auto sm:inline-grid rounded-[180px] bg-slate-100 p-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1"
            role="tablist"
            aria-label="Registration category"
          >
            {roleOptions.map((option, index) => {
              const isSelected = role === option.value;

              return (
                <>
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setRole(option.value);
                      if (option.value === "attendee") {
                        setStaffCount("1");
                        setSponsorshipCategory("");
                        setIsCategoryOpen(false);
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

                  {index === 0 && (
                    <span className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 select-none">
                      or
                    </span>
                  )}
                </>
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <div>
            <label htmlFor="sponsorshipCategory" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Category of sponsorship
            </label>
            <div className="relative">
              <button
                id="sponsorshipCategory"
                type="button"
                onClick={() => setIsCategoryOpen((prev) => !prev)}
                className={`w-full px-4 pr-12 py-5 rounded-lg border border-slate-200 bg-white text-sm transition-all duration-200 outline-none appearance-none focus:ring-2 focus:ring-green-700 focus:border-green-700 focus-visible:outline-none hover:border-slate-300 ${
                  sponsorshipCategory ? "text-slate-900" : "text-slate-400"
                }`}
                aria-haspopup="listbox"
                aria-expanded={isCategoryOpen}
                aria-label="Select sponsorship category"
              >
                <span className="block text-left">
                  {sponsorshipCategory || "Select sponsorship category"}
                </span>
              </button>
              <Icons.ChevronDown
                className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              />

              {isCategoryOpen && (
                <div
                  role="listbox"
                  aria-label="Sponsorship category options"
                  className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  {sponsorshipCategories.map((category) => {
                    const isSelected = sponsorshipCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSponsorshipCategory(category);
                          setIsCategoryOpen(false);
                          if (inputError) {
                            setInputError(null);
                          }
                        }}
                        role="option"
                        aria-selected={isSelected}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-green-700 text-white"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="staffCount" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Number of staff
            </label>
            <input
              id="staffCount"
              name="staffCount"
              type="number"
              min={1}
              step={1}
              value={staffCount}
              onChange={(e) => {
                setStaffCount(e.target.value);
                if (inputError) {
                  setInputError(null);
                }
              }}
              placeholder="e.g. 10"
              className="w-full px-4 py-5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all duration-200 outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 hover:border-slate-300"
            />
          </div>

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