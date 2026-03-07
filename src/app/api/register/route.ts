import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

// Auto-create the registrations table if it doesn't exist
async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      gender VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(30) NOT NULL,
      organisation VARCHAR(255) NOT NULL,
      designation VARCHAR(255) NOT NULL,
      registration_type VARCHAR(20) NOT NULL DEFAULT 'employee',
      sponsor_invite_code VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS registration_type VARCHAR(20) NOT NULL DEFAULT 'employee'
  `;

  await sql`
    ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS sponsor_invite_code VARCHAR(255)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sponsor_invites (
      id SERIAL PRIMARY KEY,
      sponsor_registration_id INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
      invite_code VARCHAR(255) NOT NULL UNIQUE,
      organisation VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}

const registrationTypeSchema = z.enum(["sponsor", "employee"]).default("employee");

const inviteCodeSchema = z
  .string()
  .min(8, "Invalid invite code")
  .max(255, "Invalid invite code")
  .regex(/^[a-z0-9-]+$/, "Invalid invite code")
  .optional();

function toOrganisationSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function createInviteCode(organisation: string) {
  const organisationSlug = toOrganisationSlug(organisation) || "org";
  const randomSegment = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${organisationSlug}-${randomSegment}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Server-side Zod validation
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Validation failed";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { firstName, lastName, gender, email, phone, organisation, designation } = result.data;

    const parsedRegistrationType = registrationTypeSchema.safeParse(body.registrationType);
    if (!parsedRegistrationType.success) {
      return NextResponse.json(
        { error: "Invalid registration type" },
        { status: 400 }
      );
    }

    const registrationType = parsedRegistrationType.data;

    const rawInviteCode =
      typeof body.inviteCode === "string" && body.inviteCode.trim().length > 0
        ? body.inviteCode.trim()
        : undefined;

    let inviteCode: string | undefined;
    if (registrationType === "employee") {
      const parsedInviteCode = inviteCodeSchema.safeParse(rawInviteCode);
      if (!parsedInviteCode.success) {
        return NextResponse.json(
          { error: "Invalid invite link" },
          { status: 400 }
        );
      }

      inviteCode = parsedInviteCode.data;
    }

    // Ensure the table exists
    await ensureTable();

    const sql = getDb();

    let resolvedOrganisation = organisation;
    if (registrationType === "employee" && inviteCode) {
      const inviteRows = await sql`
        SELECT organisation
        FROM sponsor_invites
        WHERE invite_code = ${inviteCode}
        LIMIT 1
      `;

      if (!inviteRows.length) {
        return NextResponse.json(
          { error: "Invalid or expired invite link" },
          { status: 400 }
        );
      }

      resolvedOrganisation = inviteRows[0].organisation;
    }

    const insertedRows = await sql`
      INSERT INTO registrations (
        first_name,
        last_name,
        gender,
        email,
        phone,
        organisation,
        designation,
        registration_type,
        sponsor_invite_code
      )
      VALUES (
        ${firstName},
        ${lastName},
        ${gender},
        ${email},
        ${phone},
        ${resolvedOrganisation},
        ${designation},
        ${registrationType},
        ${inviteCode ?? null}
      )
      RETURNING id
    `;

    const registrationId = insertedRows[0]?.id as number | undefined;

    let shareLink: string | null = null;
    if (registrationType === "sponsor" && registrationId) {
      const inviteCodeForSponsor = createInviteCode(resolvedOrganisation);

      await sql`
        INSERT INTO sponsor_invites (sponsor_registration_id, invite_code, organisation)
        VALUES (${registrationId}, ${inviteCodeForSponsor}, ${resolvedOrganisation})
      `;

      const origin = new URL(request.url).origin;
      shareLink = `${origin}/register?role=employee&invite=${inviteCodeForSponsor}`;
    }

    return NextResponse.json(
      {
        message: "Registration successful",
        shareLink,
        organisation: resolvedOrganisation,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Handle duplicate email
    if (
      error instanceof Error &&
      error.message.includes("unique") 
    ) {
      return NextResponse.json(
        { error: "This email address is already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
