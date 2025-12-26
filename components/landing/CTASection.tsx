"use client";

import Link from "next/link";
import { Terminal, ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function CTASection() {
  const { auth } = useAuth();

  return (
    <section className="py-24 bg-background text-foreground relative overflow-hidden border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs tracking-wider mb-8">
          <Terminal className="h-3 w-3" />
          READY_TO_DEPLOY
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
          Initialize Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
            Institutional Node
          </span>
        </h2>

        <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
          Join the network of 150+ financial institutions running Aegis. Deploy
          your node in minutes or access via our managed API gateway.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {auth.user ? (
            <Link href="/dashboard">
              <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border border-primary/50 font-mono uppercase tracking-wide text-lg">
                <Command className="mr-2 h-5 w-5" />
                Enter_Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border border-primary/50 font-mono uppercase tracking-wide text-lg">
                <Terminal className="mr-2 h-5 w-5" />
                Start_Deployment
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            className="h-14 px-8 border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-none font-mono uppercase tracking-wide text-lg"
          >
            Contact_Sales <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex justify-center gap-8 text-xs font-mono text-muted-foreground">
          <span>DEPLOYMENT_TIME: &lt; 5_MIN</span>
          <span>API_UPTIME: 99.99%</span>
          <span>SUPPORT: 24/7_ENGINEERING</span>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
    </section>
  );
}
