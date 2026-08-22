import { NextRequest, NextResponse } from "next/server";
import { requireInstituteAdmin } from "@/lib/auth/authorization";
import {
  getInstituteProfile,
  updateInstituteProfile,
} from "@/lib/institute/institute-service";

export async function GET() {
  try {
    const admin = await requireInstituteAdmin();
    const profile = await getInstituteProfile(admin.id);
    return NextResponse.json({ success: true, profile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireInstituteAdmin();
    const body = await req.json();
    const updated = await updateInstituteProfile(admin.id, body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
