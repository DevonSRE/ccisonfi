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
      registration_type VARCHAR(20) NOT NULL DEFAULT 'attendee',
      sponsorship_category VARCHAR(50),
      staff_count INTEGER,
      employee_count INTEGER,
      sponsor_invite_code VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS registration_type VARCHAR(20) NOT NULL DEFAULT 'attendee'
  `;

  await sql`
    ALTER TABLE registrations
    ALTER COLUMN registration_type SET DEFAULT 'attendee'
  `;

  await sql`
    UPDATE registrations
    SET registration_type = 'attendee'
    WHERE registration_type = 'employee'
  `;

  await sql`
    ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS sponsor_invite_code VARCHAR(255)
  `;

  await sql`
    ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS sponsorship_category VARCHAR(50)
  `;

  await sql`
    ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS staff_count INTEGER
  `;

  await sql`
    ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS employee_count INTEGER
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

const registrationTypeSchema = z
  .enum(["sponsor", "attendee", "employee"])
  .default("attendee")
  .transform((value) => (value === "employee" ? "attendee" : value));

const inviteCodeSchema = z
  .string()
  .min(8, "Invalid invite code")
  .max(255, "Invalid invite code")
  .regex(/^[a-z0-9-]+$/, "Invalid invite code")
  .optional();

const sponsorshipCategorySchema = z.enum(["Silver", "Gold", "Platinum"]);

const sponsorshipCategoryLimits: Record<z.infer<typeof sponsorshipCategorySchema>, number> = {
  Silver: 1,
  Gold: 2,
  Platinum: 3,
};

const staffCountSchema = z
  .number()
  .int("Staff count must be a whole number")
  .min(1, "Staff count must be at least 1");

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
  const randomSource = crypto.randomUUID().replace(/-/g, "");
  const firstSegment = randomSource.slice(0, 6);
  const secondSegment = randomSource.slice(6, 12);
  return `ccisonfi-${organisationSlug}-${firstSegment}-${secondSegment}`;
}

function createInviteLink(requestUrl: string, inviteCode: string) {
  const url = new URL("/register", requestUrl);
  url.searchParams.set("role", "attendee");
  url.searchParams.set("invite", inviteCode);
  return url.toString();
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

    const rawSponsorshipCategory =
      typeof body.sponsorshipCategory === "string" ? body.sponsorshipCategory.trim() : undefined;

    const rawStaffCount =
      typeof body.staffCount === "number"
        ? body.staffCount
        : typeof body.staffCount === "string" && body.staffCount.trim().length > 0
          ? Number.parseInt(body.staffCount, 10)
          : undefined;

    let sponsorshipCategory: "Silver" | "Gold" | "Platinum" | undefined;
    let staffCount: number | undefined;

    if (registrationType === "sponsor") {
      const parsedCategory = sponsorshipCategorySchema.safeParse(rawSponsorshipCategory);
      if (!parsedCategory.success) {
        return NextResponse.json(
          { error: "Invalid sponsorship category" },
          { status: 400 }
        );
      }

      const parsedStaffCount = staffCountSchema.safeParse(rawStaffCount);
      if (!parsedStaffCount.success) {
        return NextResponse.json(
          { error: "Invalid staff count" },
          { status: 400 }
        );
      }

      sponsorshipCategory = parsedCategory.data;
      staffCount = parsedStaffCount.data;

      const categoryLimit = sponsorshipCategoryLimits[sponsorshipCategory];
      if (staffCount > categoryLimit) {
        return NextResponse.json(
          {
            error: `${sponsorshipCategory} sponsors can only register ${categoryLimit} attendee${categoryLimit > 1 ? "s" : ""}. Please enter a lower number.`,
          },
          { status: 400 }
        );
      }
    }

    const rawInviteCode =
      typeof body.inviteCode === "string" && body.inviteCode.trim().length > 0
        ? body.inviteCode.trim()
        : undefined;

    let inviteCode: string | undefined;
    if (registrationType === "attendee") {
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
    if (registrationType === "attendee" && inviteCode) {
      const inviteRows = await sql`
        SELECT
          si.organisation,
          r.sponsorship_category,
          r.staff_count
        FROM sponsor_invites
        si
        LEFT JOIN registrations r ON r.id = si.sponsor_registration_id
        WHERE invite_code = ${inviteCode}
        LIMIT 1
      `;

      if (!inviteRows.length) {
        return NextResponse.json(
          { error: "Invalid or expired invite link" },
          { status: 400 }
        );
      }

      const inviteDetails = inviteRows[0];
      resolvedOrganisation = inviteDetails.organisation;

      const sponsorCategory = inviteDetails.sponsorship_category as "Silver" | "Gold" | "Platinum" | null;
      const staffCountLimit =
        typeof inviteDetails.staff_count === "number" && inviteDetails.staff_count > 0
          ? inviteDetails.staff_count
          : null;
      const categoryLimit = sponsorCategory ? sponsorshipCategoryLimits[sponsorCategory] : null;
      const inviteLimit = categoryLimit ?? staffCountLimit;

      if (!inviteLimit) {
        return NextResponse.json(
          { error: "Sponsor invite configuration is invalid" },
          { status: 400 }
        );
      }

      const usedSlotsRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM registrations
        WHERE sponsor_invite_code = ${inviteCode}
          AND registration_type IN ('attendee', 'employee')
      `;

      const usedSlots = usedSlotsRows[0]?.total ?? 0;
      if (usedSlots >= inviteLimit) {
        return NextResponse.json(
          { error: "This sponsor invite link has reached its registration limit." },
          { status: 400 }
        );
      }
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
        sponsorship_category,
        staff_count,
        employee_count,
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
        ${sponsorshipCategory ?? null},
        ${staffCount ?? null},
        ${staffCount ?? null},
        ${inviteCode ?? null}
      )
      RETURNING id
    `;

    const registrationId = insertedRows[0]?.id as number | undefined;

    let shareLink: string | null = null;
    if (registrationType === "sponsor" && registrationId) {
      let inviteCodeForSponsor: string | null = null;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidateCode = createInviteCode(resolvedOrganisation);
        try {
          await sql`
            INSERT INTO sponsor_invites (sponsor_registration_id, invite_code, organisation)
            VALUES (${registrationId}, ${candidateCode}, ${resolvedOrganisation})
          `;
          inviteCodeForSponsor = candidateCode;
          break;
        } catch (inviteError) {
          const message = inviteError instanceof Error ? inviteError.message.toLowerCase() : "";
          if (!message.includes("unique")) {
            throw inviteError;
          }
        }
      }

      if (!inviteCodeForSponsor) {
        throw new Error("Could not generate sponsor invite link");
      }

      shareLink = createInviteLink(request.url, inviteCodeForSponsor);
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
