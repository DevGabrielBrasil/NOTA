import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { getDatabase } from '@/lib/database';

export async function GET(request: Request) {
  // Proteção simples via header secreto
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const db = await getDatabase();

    // Buscar todos os usuários cadastrados
    const result = await db.query(
      'SELECT id, name, email FROM "user" WHERE email IS NOT NULL'
    );
    const users = result.rows;

    if (users.length === 0) {
      return NextResponse.json({ message: 'Nenhum usuário encontrado' });
    }

    const hoje = new Date();
    const mesAtual = hoje.toLocaleDateString('pt-BR', { month: 'long' });
    const anoAtual = hoje.getFullYear();

    const emailsEnviados: string[] = [];
    const erros: string[] = [];

    for (const user of users) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'NOTA <noreply@resend.dev>',
          to: user.email,
          subject: `Lembrete: Pagamento do DAS vence hoje - ${mesAtual}/${anoAtual}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Sistema de Gestão MEI</h1>
              </div>

              <div style="background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #334155;">
                  Olá, <strong>${user.name || 'Empreendedor'}</strong>!
                </p>

                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: bold;">
                    O pagamento do DAS (Documento de Arrecadação do Simples Nacional) vence hoje, dia 20 de ${mesAtual} de ${anoAtual}.
                  </p>
                </div>

                <p style="font-size: 14px; color: #64748b;">
                  Não esqueça de efetuar o pagamento para manter sua empresa regularizada.
                  Você pode gerar o boleto no
                  <a href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao" style="color: #2563eb;">
                    Portal do Empreendedor
                  </a>.
                </p>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                  Este é um lembrete automático enviado pelo Sistema de Gestão MEI.
                </p>
              </div>
            </div>
          `,
        });
        emailsEnviados.push(user.email);
      } catch (err) {
        console.error(`Erro ao enviar email para ${user.email}:`, err);
        erros.push(user.email);
      }
    }

    return NextResponse.json({
      success: true,
      enviados: emailsEnviados.length,
      erros: erros.length,
      detalhes: { emailsEnviados, erros },
    });
  } catch (error) {
    console.error('Erro no cron DAS reminder:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
