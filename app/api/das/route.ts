import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/database';

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const result = await db.query(
      `SELECT * FROM pagamentos_das
       WHERE user_id = $1
       ORDER BY ano DESC, mes DESC`,
      [session.user.id]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar pagamentos DAS:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { mes, ano, valor, data_vencimento, data_pagamento, pago, observacao } = await request.json();

    const db = await getDatabase();
    const result = await db.query(
      `INSERT INTO pagamentos_das (user_id, mes, ano, valor, data_vencimento, data_pagamento, pago, observacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, mes, ano) DO UPDATE SET
         valor = EXCLUDED.valor,
         data_vencimento = EXCLUDED.data_vencimento,
         data_pagamento = EXCLUDED.data_pagamento,
         pago = EXCLUDED.pago,
         observacao = EXCLUDED.observacao
       RETURNING id`,
      [session.user.id, mes, ano, valor, data_vencimento, data_pagamento || null, pago || false, observacao || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Pagamento DAS salvo com sucesso',
      id: result.rows[0].id
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar pagamento DAS:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id, pago, data_pagamento, observacao } = await request.json();

    const db = await getDatabase();
    await db.query(
      `UPDATE pagamentos_das SET pago = $1, data_pagamento = $2, observacao = $3
       WHERE id = $4 AND user_id = $5`,
      [pago, data_pagamento || null, observacao || null, id, session.user.id]
    );

    return NextResponse.json({ success: true, message: 'Pagamento atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar pagamento DAS:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
