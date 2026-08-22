import { NextResponse } from "next/server";
import { loginUser } from "@/lib/services/auth/login";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await loginUser(body);

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      user,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 401 }
    );
  }
}
