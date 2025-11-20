"use client";

import { HttpMethod } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Settings } from "lucide-react";

interface RequestBuilderProps {
  method: HttpMethod;
  url: string;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
  isLoading?: boolean;
}

export function RequestBuilder({
  method,
  url,
  onMethodChange,
  onUrlChange,
  onSend,
  isLoading,
}: RequestBuilderProps) {
  return (
    <div className="flex gap-2 items-center">
      <Select
        value={method}
        onValueChange={(value) => onMethodChange(value as HttpMethod)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GET">GET</SelectItem>
          <SelectItem value="POST">POST</SelectItem>
          <SelectItem value="PUT">PUT</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
          <SelectItem value="PATCH">PATCH</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Enter request URL"
        className="flex-1"
      />

      <Button onClick={onSend} disabled={isLoading || !url} size="default">
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2" />
            Sending...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run
          </>
        )}
      </Button>
    </div>
  );
}
