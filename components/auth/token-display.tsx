"use client";

import { TokenData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Check, X, Clock } from "lucide-react";
import { TokenStorage } from "@/lib/oauth/token-storage";

interface TokenDisplayProps {
  tokens: TokenData;
  onClearTokens: () => void;
  onRefreshTokens?: () => void;
}

export function TokenDisplay({
  tokens,
  onClearTokens,
  onRefreshTokens,
}: TokenDisplayProps) {
  const timeUntilExpiry = TokenStorage.getTimeUntilExpiry();
  const minutes = Math.floor(timeUntilExpiry / 60000);
  const isExpiringSoon = minutes < 5;
  const isExpired = TokenStorage.isExpired();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Token</CardTitle>
          {isExpired ? (
            <Badge variant="destructive">
              <X className="h-3 w-3 mr-1" />
              Expired
            </Badge>
          ) : isExpiringSoon ? (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Expiring Soon
            </Badge>
          ) : (
            <Badge variant="default">
              <Check className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tokens.userEmail && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">User</p>
            <p className="text-sm font-mono">{tokens.userEmail}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Token Type
          </p>
          <p className="text-sm">{tokens.tokenType}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Expires</p>
          <p className="text-sm">{formatDate(tokens.expiresAt)}</p>
          {!isExpired && (
            <p className="text-xs text-muted-foreground mt-1">
              {minutes} minutes remaining
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Access Token
          </p>
          <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
            {tokens.accessToken.substring(0, 50)}...
          </p>
        </div>

        {tokens.refreshToken && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Refresh Token
            </p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {tokens.refreshToken && onRefreshTokens && (
            <Button
              variant="outline"
              onClick={onRefreshTokens}
              className="flex-1"
            >
              Refresh Token
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={onClearTokens}
            className="flex-1"
          >
            Clear Token
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
