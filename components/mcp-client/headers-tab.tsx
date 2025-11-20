"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface HeadersTabProps {
  headers: string;
  onHeadersChange: (headers: string) => void;
}

export function HeadersTab({ headers, onHeadersChange }: HeadersTabProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="headers">Custom Headers (JSON)</Label>
      <Textarea
        id="headers"
        value={headers}
        onChange={(e) => onHeadersChange(e.target.value)}
        placeholder={`{
  "X-Custom-Header": "value",
  "Another-Header": "value"
}`}
        className="font-mono min-h-[200px]"
      />
      <p className="text-xs text-muted-foreground">
        Optional custom headers in JSON format. Authorization header will be
        added automatically if you're authenticated.
      </p>
    </div>
  );
}
