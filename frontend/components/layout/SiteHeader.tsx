import { Separator } from "@/components/ui/Separator";
import { SidebarTrigger } from "@/components/ui/Sidebar";
import { Badge } from "@/components/ui/Badge";
import { useHealthContext } from "@/contexts/HealthContext";
import { ThemeToggle } from "@/components/theme";
import { LenderOnboardingBanner } from "@/components/onboarding/LenderOnboardingBanner";

export function SiteHeader() {
  const { healthData } = useHealthContext();

  const isBackendOnline = healthData?.status === "healthy";
  const isDamlConnected = healthData?.services?.daml === "healthy";

  return (
    <>
      {/* Lender Onboarding Banner - appears on all pages */}
      <LenderOnboardingBanner />

      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="ml-auto flex items-center gap-3">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center gap-2">
              <Badge
                variant={isDamlConnected ? "default" : "secondary"}
                className="text-xs"
              >
                <div
                  className={`w-2 h-2 rounded-full mr-1 ${
                    isDamlConnected ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                {isDamlConnected ? "DAML Connected" : "DAML Offline"}
              </Badge>

              <Badge
                variant={isBackendOnline ? "default" : "destructive"}
                className="text-xs"
              >
                <div
                  className={`w-2 h-2 rounded-full mr-1 ${
                    isBackendOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {isBackendOnline ? "Backend Online" : "Backend Offline"}
              </Badge>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
