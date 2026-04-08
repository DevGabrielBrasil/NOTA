import { Bricolage_Grotesque, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "MEI+ — Gestão inteligente para o microempreendedor",
  description:
    "Controle seu faturamento, simule notas fiscais e acompanhe certidões em um só lugar. Gratuito e 100% online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
