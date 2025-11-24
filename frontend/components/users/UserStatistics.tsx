"use client";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Building,
  User,
  Shield,
  IdCard,
  AlertTriangle,
} from "lucide-react";
import type { UserData } from "@/types/api";

interface PartyStats {
  total: number;
  validParties: number;
  invalidParties: number;
  noParties: number;
  damlLedgerParties: number;
}

interface UserStatisticsProps {
  users: UserData[];
  loading: boolean;
  partyStats?: PartyStats | null;
  partyStatsLoading?: boolean;
}

export function UserStatistics({
  users,
  loading,
  partyStats,
  partyStatsLoading,
}: UserStatisticsProps) {
  // Fallback to basic database stats if DAML stats not available
  const usersWithParties = users.filter(
    (u) => u.damlParty && u.damlParty.trim() !== ""
  );
  const usersWithoutParties = users.filter(
    (u) => !u.damlParty || u.damlParty.trim() === ""
  );

  // Use DAML stats if available, otherwise fallback to database stats
  const validParties = partyStats?.validParties ?? usersWithParties.length;
  const invalidParties = partyStats?.invalidParties ?? 0;
  const needsRegeneration = partyStats
    ? partyStats.invalidParties + partyStats.noParties
    : usersWithoutParties.length;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : users.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users className="h-4 w-4" />
              All registered
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Platform growth <Users className="size-4" />
          </div>
          <div className="text-muted-foreground">Active user accounts</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Lenders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : users.filter((u) => u.role === "lender").length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Building className="h-4 w-4" />
              Institutional
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Capital providers <Building className="size-4" />
          </div>
          <div className="text-muted-foreground">Ready to fund loans</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Borrowers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading
              ? "..."
              : users.filter((u) => u.role === "borrower").length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <User className="h-4 w-4" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Seeking capital <User className="size-4" />
          </div>
          <div className="text-muted-foreground">Creating RFQ requests</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Admins</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : users.filter((u) => u.role === "admin").length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Shield className="h-4 w-4" />
              System
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Platform management <Shield className="size-4" />
          </div>
          <div className="text-muted-foreground">System administrators</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>DAML Parties</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading || partyStatsLoading ? "..." : validParties}
            <span className="text-sm text-muted-foreground font-normal">
              /{loading ? "..." : users.length}
            </span>
          </CardTitle>
          <CardAction>
            {partyStatsLoading ? (
              <Badge variant="outline">
                <IdCard className="h-4 w-4" />
                Checking...
              </Badge>
            ) : needsRegeneration > 0 ? (
              <Badge variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                {needsRegeneration} need sync
              </Badge>
            ) : (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
              >
                <IdCard className="h-4 w-4" />
                All synced
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            DAML ledger sync <IdCard className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {partyStatsLoading
              ? "Checking DAML ledger status..."
              : partyStats
              ? `${validParties} valid, ${invalidParties} invalid, ${partyStats.noParties} missing`
              : needsRegeneration > 0
              ? `${needsRegeneration} users need party regeneration`
              : "All users synced with DAML ledger"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
