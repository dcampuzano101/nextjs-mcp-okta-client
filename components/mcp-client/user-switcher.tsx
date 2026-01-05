"use client";

import { useMemo } from "react";
import { UserSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, UserPlus, Trash2, Users } from "lucide-react";
import { getUserGroups, decodeJWT, getUserEmail } from "@/lib/oauth/jwt-utils";

interface UserSwitcherProps {
  sessions: UserSession[];
  activeUserId: string | null;
  onSwitchUser: (userId: string) => void;
  onAddUser: () => void;
  onRemoveUser: (userId: string) => void;
}

export function UserSwitcher({
  sessions,
  activeUserId,
  onSwitchUser,
  onAddUser,
  onRemoveUser,
}: UserSwitcherProps) {
  const activeSession = sessions.find((s) => s.userId === activeUserId);

  // Get email from access token if not in session (for old sessions)
  const displayEmail = useMemo(() => {
    if (activeSession?.email && activeSession.email !== "No email in token") {
      return activeSession.email;
    }
    // Fallback: decode access token
    if (activeSession?.tokens.accessToken) {
      const claims = decodeJWT(activeSession.tokens.accessToken);
      if (claims) {
        return getUserEmail(claims);
      }
    }
    return "Select User";
  }, [activeSession]);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-mulesoft-light text-white hover:bg-mulesoft-light/90 border-mulesoft-light"
        >
          <Users className="h-4 w-4" />
          <span className="max-w-[200px] truncate">
            {displayEmail}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white">
        <DropdownMenuLabel className="text-mulesoft">
          Active Users ({sessions.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {sessions.map((session) => {
          const isActive = session.userId === activeUserId;
          const groups = getUserGroups(session.claims);

          return (
            <DropdownMenuItem
              key={session.userId}
              className="flex items-start gap-2 py-3 cursor-pointer hover:bg-mulesoft-light/10 focus:bg-mulesoft-light/10"
              onSelect={() => onSwitchUser(session.userId)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-mulesoft">
                    {session.displayName}
                  </span>
                  {isActive && (
                    <Badge
                      variant="default"
                      className="bg-mulesoft-light text-white text-xs"
                    >
                      Active
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-mulesoft/70 mt-1">
                  {session.email}
                </div>
                {groups.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {groups.map((group) => (
                      <Badge
                        key={group}
                        variant="outline"
                        className="text-xs bg-mulesoft/10 text-mulesoft border-mulesoft/30"
                      >
                        {group}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-mulesoft/70 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveUser(session.userId);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-mulesoft-light cursor-pointer hover:bg-mulesoft-light/10 focus:bg-mulesoft-light/10"
          onSelect={onAddUser}
        >
          <UserPlus className="h-4 w-4" />
          Add Another User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

