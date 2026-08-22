import { NextResponse } from "next/server";
import { registerCandidateUser } from "@/lib/services/auth/register";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerCandidateUser(body);

    return NextResponse.json({
      success: true,
      message: "Registration successful.",
      user,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}
