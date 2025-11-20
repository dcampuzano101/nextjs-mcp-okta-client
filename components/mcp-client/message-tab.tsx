"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MessageTabProps {
  message: string;
  onMessageChange: (message: string) => void;
}

export function MessageTab({ message, onMessageChange }: MessageTabProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="message">MCP Request Body (JSON)</Label>
      <Textarea
        id="message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder={`{
  "method": "tools/list",
  "params": {}
}`}
        className="font-mono min-h-[300px]"
      />
      <p className="text-xs text-muted-foreground">
        Enter your MCP request in JSON format. Common methods: tools/list,
        tools/call
      </p>
    </div>
  );
}
