"use client";

import { useAuth } from "@/hooks/use-auth";
import { OAuthConfigForm } from "@/components/auth/oauth-config-form";
import { TokenDisplay } from "@/components/auth/token-display";

export function AuthorizationTab() {
  const {
    tokens,
    isAuthenticated,
    isLoading,
    error,
    authorize,
    clearTokens,
    refresh,
  } = useAuth();

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          <p className="text-sm font-medium">Authentication Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isAuthenticated && tokens ? (
        <TokenDisplay
          tokens={tokens}
          onClearTokens={clearTokens}
          onRefreshTokens={tokens.refreshToken ? refresh : undefined}
        />
      ) : (
        <OAuthConfigForm onAuthorize={authorize} isLoading={isLoading} />
      )}
    </div>
  );
}
