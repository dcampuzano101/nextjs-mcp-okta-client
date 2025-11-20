"use client";

import { ResponseState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatTime } from "@/lib/utils";

interface ResponseViewerProps {
  response: ResponseState | null;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!response) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No response yet. Click "Run" to send a request.
          </p>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = () => {
    const text = JSON.stringify(response.data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "secondary";
    if (status >= 200 && status < 300) return "default";
    if (status >= 400) return "destructive";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Response</CardTitle>
          <div className="flex items-center gap-2">
            {response.status && (
              <Badge variant={getStatusColor(response.status)}>
                {response.status} {response.statusText}
              </Badge>
            )}
            {response.time !== undefined && (
              <Badge variant="outline">{formatTime(response.time)}</Badge>
            )}
            {response.data && (
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                title="Copy response"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {response.error ? (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm font-mono">{response.error}</p>
          </div>
        ) : (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[500px] overflow-y-auto">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
