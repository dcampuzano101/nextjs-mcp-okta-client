"use client";

import { useState, useEffect } from "react";
import { MCPTool } from "@/types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ToolsSidebarProps {
  tools: MCPTool[];
  selectedTool: MCPTool | null;
  onSelectTool: (tool: MCPTool) => void;
  isLoading?: boolean;
}

export function ToolsSidebar({
  tools,
  selectedTool,
  onSelectTool,
  isLoading,
}: ToolsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTools, setFilteredTools] = useState<MCPTool[]>(tools);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredTools(tools);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTools(
        tools.filter(
          (tool) =>
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, tools]);

  return (
    <div className="w-80 border-r border-mulesoft bg-muted/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-mulesoft">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-mulesoft">
            Tools {tools.length > 0 && `(${tools.length})`}
          </h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tools List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-mulesoft/70">
              Loading tools...
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="p-4 text-center text-sm text-mulesoft/70">
              {searchQuery ? "No tools found" : "No tools available"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTools.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => onSelectTool(tool)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTool?.name === tool.name
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1 truncate">
                        {tool.name}
                      </div>
                      <div className="text-xs opacity-80 line-clamp-2">
                        {tool.description}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
