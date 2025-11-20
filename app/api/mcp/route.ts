import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API proxy for MCP requests
 * This avoids CORS issues and allows secure header injection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, accessToken, mcpRequest, sessionId } = body;

    console.log("📡 MCP proxy request:", {
      endpoint: endpoint?.substring(0, 50) + "...",
      method: mcpRequest?.method || "unknown",
      hasToken: !!accessToken,
      hasSessionId: !!sessionId,
    });

    if (!endpoint) {
      return NextResponse.json(
        { error: "MCP endpoint is required" },
        { status: 400 }
      );
    }

    if (!mcpRequest) {
      return NextResponse.json(
        { error: "MCP request body is required" },
        { status: 400 }
      );
    }

    // Prepare headers for MCP request
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream", // MCP requires both media types
    };

    // Add Authorization header if access token is provided
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      console.log("✅ Added Authorization header with access token");
    } else {
      console.log("⚠️ No access token provided");
    }

    // Add MCP session ID if provided (for maintaining session across requests)
    if (sessionId) {
      headers["mcp-session-id"] = sessionId;
      console.log("✅ Added MCP session ID:", sessionId);
    }

    console.log("📤 Forwarding request to MCP endpoint...");
    console.log("📤 Request body:", JSON.stringify(mcpRequest, null, 2));

    // Forward the request to the MCP endpoint
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(mcpRequest),
    });

    console.log("📬 Response status:", response.status, response.statusText);
    console.log(
      "📬 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ MCP request failed:", response.status, errorText);
      return NextResponse.json(
        {
          error: "MCP request failed",
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Get the raw response text first
    const textData = await response.text();

    console.log("📥 Response received:", {
      length: textData.length,
      isEmpty: textData.trim() === "",
      preview: textData.substring(0, 100),
    });

    // Handle empty responses (e.g., for notifications)
    if (!textData || textData.trim() === "") {
      console.log("📭 Empty response (notification)");
      return NextResponse.json({ success: true });
    }

    // Check content type to handle SSE format
    const contentType = response.headers.get("content-type") || "";
    let responseData;

    if (
      contentType.includes("text/event-stream") ||
      textData.startsWith("data:")
    ) {
      // Parse SSE format (Server-Sent Events)
      console.log("📨 Parsing SSE response...");
      console.log("📝 Raw SSE data:", textData.substring(0, 200) + "...");

      // SSE format can have multiple events separated by blank lines
      // Format: "data: {json}\n\n"
      const events = textData.split("\n\n").filter((e) => e.trim());

      // Get the last event (most recent)
      const lastEvent = events[events.length - 1];
      const lines = lastEvent.split("\n").filter((line) => line.trim());
      const dataLine = lines.find((line) => line.startsWith("data: "));

      if (dataLine) {
        const jsonStr = dataLine.substring(6); // Remove "data: " prefix
        responseData = JSON.parse(jsonStr);
      } else {
        console.error("❌ Invalid SSE format. Raw data:", textData);
        throw new Error("Invalid SSE format: no data line found");
      }
    } else {
      // Standard JSON response
      console.log("📨 Parsing JSON response...");
      responseData = JSON.parse(textData);
    }

    console.log("✅ MCP request successful");

    // Extract session ID from response headers
    const mcpSessionId = response.headers.get("mcp-session-id");
    if (mcpSessionId) {
      console.log("🔑 MCP session ID received:", mcpSessionId);
    }

    // Return the MCP response to the client along with session ID
    return NextResponse.json({
      ...responseData,
      _sessionId: mcpSessionId, // Include session ID for client to use in subsequent requests
    });
  } catch (error) {
    console.error("❌ MCP proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
