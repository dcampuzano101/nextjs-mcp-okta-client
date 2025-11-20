import { MCPRequest, MCPResponse, ResponseState, MCPTool } from "@/types";
import { TokenStorage } from "@/lib/oauth/token-storage";

// Store MCP session ID for maintaining session across requests
let mcpSessionId: string | null = null;

export function getMCPSessionId(): string | null {
  return mcpSessionId;
}

export function setMCPSessionId(sessionId: string | null): void {
  mcpSessionId = sessionId;
  console.log("🔑 MCP session ID stored:", sessionId);
}

/**
 * Call MCP endpoint via server-side proxy (avoids CORS issues)
 */
export async function callMCPEndpoint(
  endpoint: string,
  method: string,
  mcpRequest: MCPRequest
): Promise<ResponseState> {
  const startTime = Date.now();

  try {
    // Get access token from storage
    const tokens = TokenStorage.get();
    const accessToken =
      tokens && !TokenStorage.isExpired() ? tokens.accessToken : undefined;

    console.log("📡 Calling MCP endpoint via proxy:", {
      endpoint: endpoint.substring(0, 50) + "...",
      method: mcpRequest.method,
      hasToken: !!accessToken,
      hasSessionId: !!mcpSessionId,
    });

    // Call our Next.js API proxy instead of directly calling the MCP endpoint
    const response = await fetch("/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
        accessToken,
        mcpRequest,
        sessionId: mcpSessionId, // Include session ID if we have one
      }),
    });

    const time = Date.now() - startTime;

    // Get response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Parse response body
    let data: any;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      console.error("❌ MCP request failed:", response.status, data);
    } else {
      console.log("✅ MCP request successful");

      // Extract and store session ID if present
      if (data._sessionId) {
        setMCPSessionId(data._sessionId);
      }
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: responseHeaders,
      time,
    };
  } catch (error) {
    const time = Date.now() - startTime;
    console.error("❌ MCP client error:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      time,
    };
  }
}

/**
 * Initialize MCP session
 * Required before any other MCP operations
 */
export async function initializeMCPSession(
  endpoint: string
): Promise<ResponseState> {
  console.log("🔌 Initializing MCP session...");

  const initResponse = await callMCPEndpoint(endpoint, "POST", {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
      },
      clientInfo: {
        name: "okta-mcp-ui",
        version: "1.0.0",
      },
    },
  });

  if (
    initResponse.error ||
    (initResponse.status && initResponse.status >= 400)
  ) {
    console.error("❌ MCP initialization failed");
    return initResponse;
  }

  console.log(
    "✅ MCP session initialized, server info:",
    initResponse.data?.result?.serverInfo
  );

  // Send initialized notification
  const notifyResponse = await callMCPEndpoint(endpoint, "POST", {
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {},
  });

  console.log("✅ MCP initialized notification sent");

  // Small delay to let the server process the notification
  await new Promise((resolve) => setTimeout(resolve, 100));

  return initResponse;
}

/**
 * List available MCP tools
 */
export async function listMCPTools(endpoint: string): Promise<ResponseState> {
  console.log("📋 Requesting tools list...");
  const result = await callMCPEndpoint(endpoint, "POST", {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });

  console.log("📋 Tools list response:", {
    hasError: !!result.error,
    hasData: !!result.data,
    dataKeys: result.data ? Object.keys(result.data) : [],
  });

  return result;
}

/**
 * Call a specific MCP tool
 */
export async function callMCPTool(
  endpoint: string,
  toolName: string,
  params: Record<string, any>
): Promise<ResponseState> {
  return callMCPEndpoint(endpoint, "POST", {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: toolName,
      arguments: params,
    },
  });
}
