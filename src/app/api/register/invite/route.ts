import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import getDb from "@/lib/db";

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
      SELECT organisation
      FROM sponsor_invites
      WHERE invite_code = ${parsedInviteCode.data}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json(
        { error: "Invite link is not valid" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { organisation: rows[0].organisation },
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
