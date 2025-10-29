"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </SessionProvider>
  );
}