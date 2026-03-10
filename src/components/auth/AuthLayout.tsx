"use client";

import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  hideHeader?: boolean;
}

export function AuthLayout({ children, title, description, hideHeader = false }: AuthLayoutProps) {
  return (
    <section className="min-h-screen bg-gray-100 pattern">
      {/* Banner Image */}
      <div className="relative w-full h-[280px] md:h-[340px] overflow-hidden">
        <Image
          src="/banner-flyer.jpeg"
          alt="CCISONFI Conference"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Light green gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/40 via-green-800/30 to-green-700/20 z-10" />
      </div>

      {/* Form Container - overlaps banner */}
      <div className="relative z-20 -mt-20 md:-mt-24 px-4 md:px-8 lg:px-0 pb-12">
        <div className="max-w-[900px] mx-auto bg-white shadow-sm">
          <div className="px-6 md:px-12 py-10 md:py-12 overflow-y-auto no-scrollbar">
            {/* Logo on card */}
            <div className="mb-6">
              <Link href="/">
                <div className="inline-flex max-w-full items-center gap-1 sm:gap-2.5 whitespace-nowrap">
                  <Image
                    src="/CCISONFI-Logo-v2-tb-768x164.png"
                    alt="CCISONFI Logo"
                    width={200}
                    height={68}
                    className="h-9 sm:h-12 md:h-14 w-auto object-contain shrink-0"
                    priority
                  />
                  <span className="h-9 flex items-center text-xl sm:h-12 sm:text-3xl md:h-14 md:text-[40px] leading-none font-bold tracking-wide text-[#BFA23A]">
                    CONFERENCE
                  </span>
                </div>
              </Link>
            </div>

            {/* Header */}
            {!hideHeader && (
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-medium text-slate-900 leading-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-slate-500 text-sm mt-2">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Form Slot */}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
