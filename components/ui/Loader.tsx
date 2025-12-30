/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";


interface LoaderProps {
  className?: string;
}

export function Loader({ className = "" }: LoaderProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img
        src="/loader.svg"
        alt="Loading"
        width={80}
        height={80}
        className="h-auto"
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader />
      <p className="text-lg text-foreground mt-4 font-semibold">
        Initializing Aegis...
      </p>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-4">
      <Loader />
    </div>
  );
}

export function ButtonLoader() {
  return (
    <img
      src="/loader.svg"
      alt="Loading"
      width={20}
      height={20}
      className="h-auto"
    />
  );
}

export function ProtectedRoutesLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <Loader />
      <p className="text-sm text-gray-400 mt-3">Checking authentication...</p>
    </div>
  );
}
