import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import getDb from "@/lib/db";

const sponsorshipCategoryLimits = {
  Silver: 1,
  Gold: 2,
  Platinum: 3,
} as const;

const inviteCodeSchema = z
  .string()
  .min(8, "Invalid invite code")
  .max(255, "Invalid invite code")
  .regex(/^[a-z0-9-]+$/, "Invalid invite code");

async function ensureInviteTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS sponsor_invites (
      id SERIAL PRIMARY KEY,
      sponsor_registration_id INTEGER,
      invite_code VARCHAR(255) NOT NULL UNIQUE,
      organisation VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}

export async function GET(request: NextRequest) {
  try {
    const inviteCode = request.nextUrl.searchParams.get("code");
    const parsedInviteCode = inviteCodeSchema.safeParse(inviteCode);

    if (!parsedInviteCode.success) {
      return NextResponse.json(
        { error: "Invalid invite link" },
        { status: 400 }
      );
    }

    await ensureInviteTable();

    const sql = getDb();
    const rows = await sql`
      SELECT
        si.organisation,
        r.sponsorship_category,
        r.staff_count
      FROM sponsor_invites si
      LEFT JOIN registrations r ON r.id = si.sponsor_registration_id
      WHERE si.invite_code = ${parsedInviteCode.data}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json(
        { error: "Invite link is not valid" },
        { status: 404 }
      );
    }

    const inviteDetails = rows[0];
    const sponsorCategory = inviteDetails.sponsorship_category as keyof typeof sponsorshipCategoryLimits | null;
    const categoryLimit = sponsorCategory ? sponsorshipCategoryLimits[sponsorCategory] : null;
    const staffCountLimit =
      typeof inviteDetails.staff_count === "number" && inviteDetails.staff_count > 0
        ? inviteDetails.staff_count
        : null;
    const inviteLimit = categoryLimit ?? staffCountLimit;

    if (!inviteLimit) {
      return NextResponse.json(
        { error: "Invite link configuration is invalid" },
        { status: 400 }
      );
    }

    const usedSlotsRows = await sql`
      SELECT COUNT(*)::int AS total
      FROM registrations
      WHERE sponsor_invite_code = ${parsedInviteCode.data}
        AND registration_type IN ('attendee', 'employee')
    `;

    const usedSlots = usedSlotsRows[0]?.total ?? 0;
    if (usedSlots >= inviteLimit) {
      return NextResponse.json(
        { error: "This invite link has reached its registration limit" },
        { status: 410 }
      );
    }

    return NextResponse.json(
      {
        organisation: inviteDetails.organisation,
        remainingSlots: Math.max(inviteLimit - usedSlots, 0),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Invite lookup error:", error);
    return NextResponse.json(
      { error: "Could not validate invite link" },
      { status: 500 }
    );
  }
}
