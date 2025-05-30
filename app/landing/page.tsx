"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* HEADER */}
      <header className="w-full flex justify-between items-center px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold text-indigo-600">MEI+</h1>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => router.push("/login")}>
            Entrar
          </Button>
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => router.push("/registro")}>
            Criar Conta
          </Button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex flex-col items-center justify-center px-4 py-16 flex-1">
        <section className="text-center max-w-4xl mb-12">
          <h2 className="text-5xl font-extrabold text-indigo-600 mb-4">Seu sistema completo de gestão MEI</h2>
          <p className="text-lg text-gray-600 mb-8">
            Controle seu faturamento, simule notas fiscais e receba alertas de vencimento de certidões. Tudo 100% online e gratuito.
          </p>
        </section>

        {/* INFORMAÇÕES */}
        <section className="bg-gray-100 rounded-lg p-6 shadow-md w-full max-w-4xl mb-10 text-left">
          <h3 className="text-2xl font-bold mb-4">📊 Números que impressionam</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Mais de <strong>15 milhões de MEIs</strong> no Brasil</li>
            <li>💸 Gasto médio com contabilidade: <strong>R$ 1.200 a R$ 2.400 por ano</strong></li>
            <li>📈 Com o MEI+ você economiza e <strong>mantém tudo sob controle</strong></li>
          </ul>
        </section>

        {/* FUNCIONALIDADES */}
        <section className="w-full max-w-4xl">
          <h3 className="text-2xl font-bold mb-6 text-center">⚙️ Funcionalidades do MEI+</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <Feature title="💰 Cálculo de Faturamento Total">
              Veja quanto você já faturou no ano e mantenha-se dentro do limite legal.
            </Feature>
            <Feature title="📄 Simulador de Notas Fiscais">
              Gere notas simuladas com facilidade e controle seus serviços prestados.
            </Feature>
            <Feature title="⏰ Alertas de Certidões">
              Receba notificações quando uma certidão estiver prestes a vencer.
            </Feature>
            <Feature title="☁️ Armazenamento Seguro">
              Todos os seus dados ficam salvos na nuvem com segurança e confiabilidade.
            </Feature>
          </div>
        </section>
      </main>
    </div>
  )
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition duration-200 border border-gray-200">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  )
}
