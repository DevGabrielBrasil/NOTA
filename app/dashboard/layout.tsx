"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUser,
  FileText,
  LayoutDashboard,
  Calculator,
  Receipt,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/das", label: "DAS", icon: Receipt },
  { href: "/dashboard/certidoes", label: "Certidões", icon: FileText },
  { href: "/dashboard/simulador", label: "Simulador", icon: Calculator },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut, session } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  const userName = session.user?.name || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-sans">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-6">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-display text-base font-black leading-none">
                M
              </span>
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-black text-accent-foreground">
                +
              </span>
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight">
              MEI<span className="text-primary">+</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden h-10 items-center gap-2 rounded-full pl-1.5 pr-3 md:flex"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium">
                    {userName.split(" ")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground">Logado como</p>
                  <p className="truncate text-sm font-semibold">{userName}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil">
                    <CircleUser className="mr-2 h-4 w-4" />
                    <span>Meu perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="border-t bg-background md:hidden">
            <nav className="mx-auto max-w-7xl px-4 py-3">
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-muted-foreground">Conta MEI+</p>
                </div>
              </div>

              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href="/dashboard/perfil"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <CircleUser className="h-4 w-4" />
                    Meu perfil
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
