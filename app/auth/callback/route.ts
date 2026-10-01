import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Ziel von Bestätigungs- und Magic-Links: tauscht den Code gegen eine Session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  // Nur relative Pfade erlauben (kein Open Redirect).
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { error: true };
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
