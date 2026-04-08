import Link from "next/link";
import {
  ArrowRight,
  Wallet,
  FileSpreadsheet,
  BellRing,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 -right-32 h-[560px] w-[560px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-80 -left-40 h-[480px] w-[480px] rounded-full bg-accent/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* HEADER */}
      <header className="relative z-10 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-xl font-extrabold tracking-tight">
              MEI<span className="text-primary">+</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#recursos"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Recursos
            </a>
            <a
              href="#numeros"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Por que usar
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href="/registro">
                Criar conta <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl gap-16 px-6 pt-12 pb-24 md:grid-cols-12 md:pt-20 lg:pt-28">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              100% gratuito · sem contador
            </div>

            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Gestão MEI{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">sem rodeios</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-accent/60 sm:bottom-2 sm:h-4"
                />
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Controle seu faturamento, emita notas simuladas e nunca mais
              esqueça uma certidão. Tudo num painel que você entende em{" "}
              <strong className="text-foreground">30 segundos</strong>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                asChild
                className="rounded-full px-7 text-base shadow-lg shadow-primary/20"
              >
                <Link href="/registro">
                  Começar grátis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full px-7 text-base"
              >
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Dados criptografados
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Alertas automáticos
              </div>
            </div>
          </div>

          {/* Hero visual — stacked preview cards */}
          <div className="relative md:col-span-5">
            <div className="relative mx-auto max-w-sm">
              {/* Decorative frame */}
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-2xl" />

              {/* Main card — faturamento */}
              <div className="rounded-3xl border bg-card p-6 shadow-2xl shadow-primary/5 ring-1 ring-black/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Faturamento 2026
                    </p>
                    <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">
                      R$ 47.820
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    58% do limite
                  </div>
                </div>
                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-primary to-primary/70" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">
                      Este mês
                    </p>
                    <p className="mt-0.5 font-display text-lg font-bold">
                      R$ 6.120
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">
                      Notas
                    </p>
                    <p className="mt-0.5 font-display text-lg font-bold">12</p>
                  </div>
                </div>
              </div>

              {/* Floating alert card */}
              <div className="absolute -bottom-8 -left-10 hidden w-60 rotate-[-4deg] rounded-2xl border bg-card p-4 shadow-xl ring-1 ring-black/5 sm:block">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accent/20 p-2">
                    <BellRing className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Certidão negativa</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Vence em 12 dias
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating note card */}
              <div className="absolute -top-6 -right-8 hidden w-52 rotate-[5deg] rounded-2xl border bg-card p-4 shadow-xl ring-1 ring-black/5 sm:block">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                    NF-e emitida
                  </p>
                </div>
                <p className="mt-1.5 font-display text-lg font-bold">R$ 1.450,00</p>
                <p className="text-[11px] text-muted-foreground">
                  Consultoria · Ana Silva
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section
          id="numeros"
          className="border-y bg-foreground text-background"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-y-10 px-6 py-14 sm:grid-cols-3 sm:gap-8">
            <Stat number="15M+" label="MEIs ativos no Brasil" />
            <Stat
              number="R$ 2.400"
              label="Gasto médio anual com contabilidade"
              highlight
            />
            <Stat number="R$ 0" label="O que você paga no MEI+" />
          </div>
        </section>

        {/* FEATURES */}
        <section id="recursos" className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              Recursos
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Tudo que o seu MEI precisa.
              <br />
              <span className="text-muted-foreground">Nada do que não precisa.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<Wallet className="h-5 w-5" />}
              title="Faturamento em tempo real"
              desc="Acompanhe quanto você já faturou no ano e receba alertas antes de estourar o limite legal."
            />
            <Feature
              icon={<FileSpreadsheet className="h-5 w-5" />}
              title="Notas fiscais sem fricção"
              desc="Simule, importe XML do Emissor Nacional e mantenha o histórico completo em um clique."
              featured
            />
            <Feature
              icon={<BellRing className="h-5 w-5" />}
              title="Alertas de certidões"
              desc="Seja avisado antes do vencimento de CNDs, CCMEI e outras obrigações."
            />
            <Feature
              icon={<TrendingUp className="h-5 w-5" />}
              title="Relatórios prontos"
              desc="Relatório anual em PDF pronto para imprimir ou enviar ao seu contador, se preferir."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Dados seguros"
              desc="Criptografia ponta a ponta e autenticação moderna. Seus dados são só seus."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Simulador MEI → ME"
              desc="Descubra se vale a pena migrar de MEI para ME com base no seu faturamento real."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-3xl border bg-primary p-10 text-primary-foreground sm:p-16">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
            />
            <div className="relative max-w-2xl">
              <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                Comece agora. Leva menos de 2 minutos.
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Sem cartão de crédito, sem amarras, sem letras miúdas.
              </p>
              <Button
                size="lg"
                asChild
                className="mt-8 rounded-full bg-background px-7 text-base text-foreground hover:bg-background/90"
              >
                <Link href="/registro">
                  Criar minha conta <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-sm font-extrabold">
              MEI<span className="text-primary">+</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MEI+. Feito para o microempreendedor brasileiro.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <span className="font-display text-base font-black leading-none">M</span>
      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-black text-accent-foreground">
        +
      </span>
    </div>
  );
}

function Stat({
  number,
  label,
  highlight,
}: {
  number: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center sm:text-left">
      <p
        className={`font-display text-4xl font-extrabold tracking-tight sm:text-5xl ${
          highlight ? "text-accent" : ""
        }`}
      >
        {number}
      </p>
      <p className="mt-2 text-sm text-background/70">{label}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
  featured,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`group relative rounded-2xl border p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        featured
          ? "border-primary/30 bg-primary/5 shadow-md shadow-primary/5"
          : "bg-card hover:border-primary/30"
      }`}
    >
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
          featured
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}
