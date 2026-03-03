import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { registerSchema } from "@/lib/validations";

// Auto-create the registrations table if it doesn't exist
async function ensureTable() {
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
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

    // Ensure the table exists
    await ensureTable();

    // Insert the registration
    await sql`
      INSERT INTO registrations (first_name, last_name, gender, email, phone, organisation, designation)
      VALUES (${firstName}, ${lastName}, ${gender}, ${email}, ${phone}, ${organisation}, ${designation})
    `;

    return NextResponse.json(
      { message: "Registration successful" },
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
