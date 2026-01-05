"use client";

import { useState, useEffect } from "react";
import { useMultiUserAuth } from "@/hooks/use-multi-user-auth";
import { ResponseState, MCPTool } from "@/types";
import {
  listMCPTools,
  callMCPTool,
  initializeMCPSession,
} from "@/lib/mcp/client";
import { Navbar } from "./navbar";
import { JWTDisplayPanel } from "./jwt-display-panel";
import { ToolsSidebar } from "./tools-sidebar";
import { ToolForm } from "./tool-form";
import { ResponseViewer } from "./response-viewer";
import { EndpointManager } from "./endpoint-manager";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

export function MCPClient() {
  const {
    sessions,
    activeUserId,
    activeSession,
    activeToken,
    isAuthenticated,
    isLoading: authLoading,
    authorize,
    switchUser,
    removeUser,
    clearAllUsers,
  } = useMultiUserAuth();

  // MCP State
  const [endpoint, setEndpoint] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_MCP_ENDPOINT || ""
  );
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showEndpointManager, setShowEndpointManager] = useState(false);

  // Fetch tools when authenticated or when active user changes
  useEffect(() => {
    if (isAuthenticated && endpoint && activeToken) {
      fetchTools();
    } else {
      setTools([]);
      setSelectedTool(null);
    }
  }, [isAuthenticated, endpoint, activeUserId]); // Re-fetch when switching users

  const fetchTools = async () => {
    if (!endpoint) return;

    setIsLoadingTools(true);
    setResponse(null);

    try {
      console.log("🔌 Initializing MCP session for user:", activeSession?.email);

      // Step 1: Initialize MCP session
      const initResult = await initializeMCPSession(endpoint);

      if (initResult.error) {
        setResponse(initResult);
        setTools([]);
        return;
      }

      console.log("✅ MCP session initialized, fetching tools...");

      // Step 2: List tools after successful initialization
      const result = await listMCPTools(endpoint);

      if (result.error) {
        setResponse(result);
        setTools([]);
      } else if (result.data?.result?.tools) {
        // JSON-RPC 2.0 format: result contains the actual data
        setTools(result.data.result.tools);
        setResponse(result);
      } else if (result.data?.tools) {
        // Fallback to direct tools format
        setTools(result.data.tools);
        setResponse(result);
      } else {
        setTools([]);
        setResponse({
          error: "No tools returned from endpoint",
          time: result.time,
        });
      }
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : "Failed to fetch tools",
        time: 0,
      });
      setTools([]);
    } finally {
      setIsLoadingTools(false);
    }
  };

  const handleToolSelect = (tool: MCPTool) => {
    setSelectedTool(tool);
    setResponse(null);
  };

  const handleSwitchUser = (userId: string) => {
    switchUser(userId);
    // Clear MCP state when switching users
    setResponse(null);
    setTools([]);
    setSelectedTool(null);
  };

  const handleRemoveUser = (userId: string) => {
    removeUser(userId);
    // Clear MCP state
    setResponse(null);
    setTools([]);
    setSelectedTool(null);
  };

  const handleClearAll = () => {
    clearAllUsers();
    // Clear all MCP state
    setResponse(null);
    setTools([]);
    setSelectedTool(null);
  };

  const handleSelectEndpoint = (url: string) => {
    setEndpoint(url);
    setShowEndpointManager(false);
  };

  const handleToolSubmit = async (
    toolName: string,
    params: Record<string, any>
  ) => {
    if (!endpoint) return;

    setIsExecuting(true);
    setResponse(null);

    try {
      const result = await callMCPTool(endpoint, toolName, params);
      setResponse(result);
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : "Tool execution failed",
        time: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <Navbar
        sessions={sessions}
        activeUserId={activeUserId}
        onAuthorize={authorize}
        onSwitchUser={handleSwitchUser}
        onRemoveUser={handleRemoveUser}
        onClearAll={handleClearAll}
        isLoading={authLoading}
      />

      {/* JWT Display Panel - Show when authenticated */}
      {isAuthenticated && activeSession && (
        <JWTDisplayPanel session={activeSession} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Tools Sidebar */}
        {isAuthenticated && (
          <ToolsSidebar
            tools={tools}
            selectedTool={selectedTool}
            onSelectTool={handleToolSelect}
            isLoading={isLoadingTools}
          />
        )}

        {/* Right: Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Endpoint URL */}
          <div className="p-4 border-b border-mulesoft">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="endpoint"
                  className="text-mulesoft font-semibold"
                >
                  MCP Endpoint
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEndpointManager(!showEndpointManager)}
                  className="gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  {showEndpointManager ? "Hide" : "Saved Endpoints"}
                </Button>
              </div>
              <Input
                id="endpoint"
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="Enter MCP endpoint URL"
                disabled={!isAuthenticated}
              />
            </div>

            {/* Endpoint Manager */}
            {showEndpointManager && (
              <div className="mt-4">
                <EndpointManager
                  currentEndpoint={endpoint}
                  onSelectEndpoint={handleSelectEndpoint}
                />
              </div>
            )}
          </div>

          {/* Tool Form or Empty State + Response */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              {!isAuthenticated ? (
                <Card className="border-mulesoft">
                  <CardContent className="p-6">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-medium text-mulesoft">
                        Click "Authorize" to get started
                      </p>
                      <p className="text-sm text-mulesoft/70">
                        You need to authenticate with Okta to access MCP tools
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : !selectedTool ? (
                <Card className="border-mulesoft">
                  <CardContent className="p-6">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-medium text-mulesoft">
                        {tools.length > 0
                          ? "Select a tool to get started"
                          : isLoadingTools
                          ? "Loading tools..."
                          : "No tools available"}
                      </p>
                      <p className="text-sm text-mulesoft/70">
                        {tools.length > 0
                          ? "Choose a tool from the sidebar to see its parameters"
                          : isLoadingTools
                          ? "Fetching available tools from the MCP endpoint..."
                          : "Make sure your endpoint is correct and try refreshing"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ToolForm
                  tool={selectedTool}
                  onSubmit={handleToolSubmit}
                  isLoading={isExecuting}
                />
              )}

              {/* Response Viewer - Now inside scrollable area */}
              {response && (
                <div className="border-t pt-4">
                  <ResponseViewer response={response} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
