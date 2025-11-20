"use client";

import { useState, useEffect } from "react";
import { SavedEndpoint, EndpointStorage } from "@/lib/mcp/endpoint-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Bookmark, Clock } from "lucide-react";

interface EndpointManagerProps {
  currentEndpoint: string;
  onSelectEndpoint: (url: string) => void;
}

export function EndpointManager({
  currentEndpoint,
  onSelectEndpoint,
}: EndpointManagerProps) {
  const [savedEndpoints, setSavedEndpoints] = useState<SavedEndpoint[]>([]);
  const [newName, setNewName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load saved endpoints on mount
  useEffect(() => {
    loadEndpoints();
  }, []);

  const loadEndpoints = () => {
    const endpoints = EndpointStorage.getAll();
    // Sort by last used (most recent first)
    endpoints.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    setSavedEndpoints(endpoints);
  };

  const handleSaveCurrentEndpoint = () => {
    if (!newName.trim() || !currentEndpoint.trim()) return;

    EndpointStorage.save(newName.trim(), currentEndpoint);
    setNewName("");
    setIsAddingNew(false);
    loadEndpoints();
  };

  const handleDeleteEndpoint = (id: string) => {
    EndpointStorage.delete(id);
    loadEndpoints();
  };

  const handleSelectEndpoint = (endpoint: SavedEndpoint) => {
    EndpointStorage.markAsUsed(endpoint.url);
    onSelectEndpoint(endpoint.url);
    loadEndpoints();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Endpoints
            </CardTitle>
            <CardDescription>
              Save and manage your MCP endpoints (like Postman)
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant={isAddingNew ? "secondary" : "default"}
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isAddingNew ? "Cancel" : "Save Current"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Endpoint Form */}
        {isAddingNew && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="endpoint-name">Endpoint Name</Label>
              <Input
                id="endpoint-name"
                placeholder="e.g., Production CRM MCP"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveCurrentEndpoint();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <div className="text-sm text-muted-foreground p-2 bg-background rounded border">
                {currentEndpoint || "No endpoint set"}
              </div>
            </div>
            <Button
              onClick={handleSaveCurrentEndpoint}
              disabled={!newName.trim() || !currentEndpoint.trim()}
              className="w-full"
            >
              Save Endpoint
            </Button>
          </div>
        )}

        {/* Saved Endpoints List */}
        <ScrollArea className="h-[300px]">
          {savedEndpoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No saved endpoints yet</p>
              <p className="text-xs mt-1">Click "Save Current" to add one</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedEndpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className={`group p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                    endpoint.url === currentEndpoint
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => handleSelectEndpoint(endpoint)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {endpoint.name}
                        </span>
                        {endpoint.url === currentEndpoint && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {endpoint.url}
                      </p>
                      {endpoint.lastUsed && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(endpoint.lastUsed)}
                        </div>
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEndpoint(endpoint.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
