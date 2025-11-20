"use client";

import { useState } from "react";
import { OAuthConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OAuthConfigFormProps {
  onAuthorize: (config: OAuthConfig) => void;
  isLoading?: boolean;
}

export function OAuthConfigForm({
  onAuthorize,
  isLoading,
}: OAuthConfigFormProps) {
  const [provider, setProvider] = useState<"okta" | "auth0" | "custom">("okta");
  const [clientId, setClientId] = useState(
    process.env.NEXT_PUBLIC_OKTA_CLIENT_ID || ""
  );
  const [issuer, setIssuer] = useState(
    process.env.NEXT_PUBLIC_OKTA_ISSUER || ""
  );
  const [authEndpoint, setAuthEndpoint] = useState(
    process.env.NEXT_PUBLIC_OKTA_AUTH_ENDPOINT || ""
  );
  const [tokenEndpoint, setTokenEndpoint] = useState(
    process.env.NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT || ""
  );
  const [scopes, setScopes] = useState(
    process.env.NEXT_PUBLIC_OKTA_SCOPES || "openid profile email"
  );

  const handleProviderChange = (value: string) => {
    const providerType = value as "okta" | "auth0" | "custom";
    setProvider(providerType);

    if (providerType === "okta") {
      setIssuer(process.env.NEXT_PUBLIC_OKTA_ISSUER || "");
      setAuthEndpoint(process.env.NEXT_PUBLIC_OKTA_AUTH_ENDPOINT || "");
      setTokenEndpoint(process.env.NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT || "");
      setScopes("openid profile email");
    } else if (providerType === "auth0") {
      setIssuer("");
      setAuthEndpoint("");
      setTokenEndpoint("");
      setScopes("openid profile email");
    } else {
      // Custom - clear all fields
      setIssuer("");
      setAuthEndpoint("");
      setTokenEndpoint("");
      setScopes("openid profile email");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: OAuthConfig = {
      provider,
      issuer,
      authorizationEndpoint: authEndpoint,
      tokenEndpoint,
      clientId,
      redirectUri:
        process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI ||
        "http://localhost:3000/api/auth/callback",
      scopes: scopes.split(" ").filter(Boolean),
    };

    onAuthorize(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OAuth2 Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="auth0">Auth0</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="your-client-id"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer">Issuer</Label>
            <Input
              id="issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="https://your-domain.okta.com/oauth2/default"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authEndpoint">Authorization Endpoint</Label>
            <Input
              id="authEndpoint"
              value={authEndpoint}
              onChange={(e) => setAuthEndpoint(e.target.value)}
              placeholder="https://your-domain.okta.com/oauth2/default/v1/authorize"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenEndpoint">Token Endpoint</Label>
            <Input
              id="tokenEndpoint"
              value={tokenEndpoint}
              onChange={(e) => setTokenEndpoint(e.target.value)}
              placeholder="https://your-domain.okta.com/oauth2/default/v1/token"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scopes">Scopes (space-separated)</Label>
            <Input
              id="scopes"
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              placeholder="openid profile email"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Authorizing..." : "Authorize"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
