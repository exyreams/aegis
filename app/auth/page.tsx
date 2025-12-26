"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm, RegistrationForm } from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { auth } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push("/dashboard");
    }
  }, [auth.isAuthenticated, router]);

  const handleRegistrationSuccess = () => {
    // Auto-redirect to dashboard after successful registration
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const formVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.55, 0.06, 0.68, 0.19] as const,
      },
    },
  };

  const sidebarVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        delay: 0.2,
      },
    },
  };

  return (
    <div className="overflow-x-hidden">
      <motion.div
        className="grid min-h-svh lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Panel - Auth Forms */}
        <div className="flex flex-col gap-4 p-6 md:p-10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          {/* Header */}
          <motion.div
            className="flex justify-center gap-2 md:justify-start relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/"
              className="flex items-center gap-2 font-medium text-lg"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/aegis.svg"
                  alt="Aegis"
                  width={32}
                  height={32}
                  className="object-contain dark:hidden"
                />
                <Image
                  src="/aegis_dark.svg"
                  alt="Aegis"
                  width={32}
                  height={32}
                  className="object-contain hidden dark:block"
                />
              </motion.div>
              <span className="font-bold text-foreground">Aegis</span>
            </Link>
          </motion.div>

          {/* Form Container */}
          <div className="flex flex-1 items-center justify-center relative z-10">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {mode === "login" ? (
                    <LoginForm />
                  ) : (
                    <RegistrationForm onSuccess={handleRegistrationSuccess} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Mode Toggle */}
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-sm text-muted-foreground">
                  {mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        onClick={() => setMode("register")}
                        className="text-primary hover:text-primary/80 cursor-pointer underline underline-offset-4 font-medium transition-colors"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => setMode("login")}
                        className="text-primary hover:text-primary/80 cursor-pointer underline underline-offset-4 font-medium transition-colors"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Powered by text */}
          <motion.div
            className="text-center text-xs text-muted-foreground relative z-10 pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Powered by advanced AI and smart contracts
          </motion.div>
        </div>

        {/* Theme Toggle - Bottom Left */}
        <motion.div
          className="fixed bottom-6 left-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <div className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-200">
            <ThemeToggle direction="bottom-left" className="size-4" />
          </div>
        </motion.div>

        {/* Right Panel - Marketing Content */}
        <motion.div
          className="bg-muted relative hidden lg:block overflow-hidden"
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated background */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background"
              animate={{
                background: [
                  "linear-gradient(135deg, hsl(var(--primary))/0.2, hsl(var(--primary))/0.1, hsl(var(--background)))",
                  "linear-gradient(135deg, hsl(var(--secondary))/0.2, hsl(var(--primary))/0.1, hsl(var(--background)))",
                  "linear-gradient(135deg, hsl(var(--primary))/0.2, hsl(var(--primary))/0.1, hsl(var(--background)))",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: [0.42, 0, 0.58, 1] as const,
              }}
            />

            {/* Floating elements */}
            <motion.div
              className="absolute top-20 right-8 w-32 h-32 rounded-full bg-primary/5 blur-xl"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: [0.42, 0, 0.58, 1] as const,
              }}
            />
            <motion.div
              className="absolute bottom-32 left-8 w-24 h-24 rounded-full bg-secondary/5 blur-xl"
              animate={{
                y: [0, 20, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: [0.42, 0, 0.58, 1] as const,
                delay: 1,
              }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  type: "spring",
                  stiffness: 150,
                }}
                className="mb-8"
              >
                <Image
                  src="/auth_animation.svg"
                  alt="Aegis Authentication"
                  width={256}
                  height={256}
                  className="mx-auto object-contain"
                  priority
                />
              </motion.div>

              <motion.h2
                className="text-3xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                {mode === "login" ? "Welcome Back" : "Join Aegis"}
              </motion.h2>

              <motion.p
                className="text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {mode === "login"
                  ? "Access your complete loan lifecycle platform. Manage documents, monitor compliance, track ESG metrics, and automate trading workflows."
                  : "Join the future of lending. Create, manage, and trade loans with AI-powered document processing, automated compliance, and comprehensive ESG reporting."}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
