import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("🔄 OAuth callback received:", {
    code: code?.substring(0, 10) + "...",
    state,
    error,
  });

  // Handle OAuth errors
  if (error) {
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        "/?error=" + encodeURIComponent("Missing code or state parameter"),
        request.url
      )
    );
  }

  // Redirect back to home page with code and state
  // The client-side code will handle the token exchange via /api/auth/token
  return NextResponse.redirect(
    new URL(
      `/?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      request.url
    )
  );
}
