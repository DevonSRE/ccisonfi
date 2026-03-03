"use client";

import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <section className="min-h-screen bg-white flex flex-col lg:grid lg:grid-cols-12">
      {/* Left Column - Image & Overlay (5 Columns) */}
      <div className="relative hidden lg:block lg:col-span-5 h-screen sticky top-0 overflow-hidden">
        <Image
          src="/v3-CCISONFI-6-WhatWeDoCybersecurity-Awareness2.png"
          alt="CCISONFI Community"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

        <div className="absolute top-12 left-12 z-20">
          <Link href="/">
            <Image
              src="/CCISONFI-Logo-v2-tb-768x164.png"
              alt="CCISONFI Logo"
              width={240}
              height={80}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="absolute bottom-20 left-12 right-12 z-20 text-white">
          <h2 className="text-3xl xl:text-4xl font-semi-medium leading-tight mb-6">
            Securing Cyberspace. <br />
            <span className="text-green-500 font-semi-medium">Empowering Organizations.</span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md font-light font-semi-medium">
            Join a trusted network of cybersecurity professionals. Access
            exclusive resources, certifications, and growth opportunities today.
          </p>
        </div>
      </div>

      {/* Right Column - Auth Content (7 Columns) */}
      <div className="h-screen flex flex-col relative lg:col-span-7 bg-white overflow-hidden pattern">
        {/* Desktop Back Button */}
        

        <div className="flex-1 flex flex-col lg:items-start px-6 md:px-12 xl:px-24 py-12 lg:pt-32 w-full max-w-[1024px] mx-auto overflow-y-auto no-scrollbar">
          <div className="w-full space-y-6 my-auto">
            {/* Header */}
            <div className="text-center lg:text-left space-y-2 pb-6 border-b border-slate-50 flex flex-col items-center lg:items-start">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-4">
                <Link href="/">
                  <Image
                    src="/CCISONFI-Logo-v2-tb-768x164.png"
                    alt="CCISONFI Logo"
                    width={140}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                </Link>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-slate-600 text-lg font-medium">
                {description}
              </p>
            </div>

            {/* Form Slot */}
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="hidden lg:flex py-6 border-t border-slate-50 text-center lg:text-left lg:px-12 xl:px-24 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <span>
            &copy; {new Date().getFullYear()} CCISONFI. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="hover:text-slate-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="hover:text-slate-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="hover:text-slate-600 transition-colors"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
