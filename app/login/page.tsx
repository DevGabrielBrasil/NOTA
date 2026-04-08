"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Loader2, ArrowLeft, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export default function LoginPage() {
  const { signIn, session } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session.user && !session.isLoading) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
    } finally {
      setIsLoading(false);
    }
  };

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* BRAND SIDE */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground)) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-accent/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -top-20 -left-10 h-[360px] w-[360px] rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground text-primary">
            <span className="font-display text-lg font-black leading-none">M</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-black text-accent-foreground">
              +
            </span>
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            MEI+
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Bem-vindo de volta
          </div>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight xl:text-5xl">
            Sua gestão MEI,
            <br />
            <span className="text-accent">organizada de verdade.</span>
          </h2>
          <p className="mt-5 text-base text-primary-foreground/80">
            Acompanhe faturamento, emita notas e nunca mais perca um prazo.
          </p>

          <div className="mt-10 space-y-4">
            <Benefit
              icon={<TrendingUp className="h-4 w-4" />}
              text="Faturamento em tempo real"
            />
            <Benefit
              icon={<ShieldCheck className="h-4 w-4" />}
              text="Seus dados sempre protegidos"
            />
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} MEI+ · Feito para o microempreendedor brasileiro
        </p>
      </aside>

      {/* FORM SIDE */}
      <main className="flex w-full flex-col px-6 py-10 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <div className="flex flex-1 items-center">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <Link
              href="/"
              className="mb-8 flex items-center gap-2 lg:hidden"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-display text-lg font-black leading-none">M</span>
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-black text-accent-foreground">
                  +
                </span>
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight">
                MEI+
              </span>
            </Link>

            <h1 className="font-display text-4xl font-extrabold tracking-tight">
              Entrar
            </h1>
            <p className="mt-2 text-muted-foreground">
              Acesse sua conta para continuar.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="voce@exemplo.com"
                          className="h-12 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-semibold">
                          Senha
                        </FormLabel>
                        <Link
                          href="/login"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Esqueci minha senha
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          className="h-12 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl text-base shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link
                href="/registro"
                className="font-semibold text-primary hover:underline"
              >
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur">
        {icon}
      </div>
      <span className="text-sm font-medium text-primary-foreground/90">
        {text}
      </span>
    </div>
  );
}
