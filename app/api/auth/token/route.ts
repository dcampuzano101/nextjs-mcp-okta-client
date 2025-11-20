import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API route to exchange authorization code for tokens
 * This is necessary because the client secret must be kept secure on the server
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, codeVerifier, config } = body;

    console.log("🔐 Token exchange request received");

    if (!code || !codeVerifier || !config) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Prepare the token request
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    });

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // Add client credentials as Basic Auth (required by Okta/Exchange)
    const clientSecret = process.env.OKTA_CLIENT_SECRET;
    const clientId = config.clientId;

    if (clientSecret && clientId) {
      // Encode client_id:client_secret as Base64 for Basic Auth
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );
      headers["Authorization"] = `Basic ${credentials}`;
      console.log("✅ Added Basic Auth header with client credentials");
    } else {
      // If no secret, send client_id in body (public client)
      params.append("client_id", clientId);
      console.log("⚠️ No client secret found, using public client flow");
    }

    console.log("📤 Making token request to:", config.tokenEndpoint);

    // Exchange code for tokens
    const response = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers,
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Token exchange failed:", errorText);
      return NextResponse.json(
        { error: "Token exchange failed", details: errorText },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    console.log("✅ Token exchange successful");

    // Return the tokens to the client
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("❌ Token exchange error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Server-side API route to refresh access token
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, config } = body;

    console.log("🔄 Token refresh request received");

    if (!refreshToken || !config) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Prepare the refresh token request
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // Add client credentials as Basic Auth (required by Okta/Exchange)
    const clientSecret = process.env.OKTA_CLIENT_SECRET;
    const clientId = config.clientId;

    if (clientSecret && clientId) {
      // Encode client_id:client_secret as Base64 for Basic Auth
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );
      headers["Authorization"] = `Basic ${credentials}`;
      console.log("✅ Added Basic Auth header with client credentials");
    } else {
      // If no secret, send client_id in body (public client)
      params.append("client_id", clientId);
      console.log("⚠️ No client secret found, using public client flow");
    }

    console.log("📤 Making refresh token request to:", config.tokenEndpoint);

    // Refresh the token
    const response = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers,
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Token refresh failed:", errorText);
      return NextResponse.json(
        { error: "Token refresh failed", details: errorText },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    console.log("✅ Token refresh successful");

    // Return the refreshed tokens to the client
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
