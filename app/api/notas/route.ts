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
      `SELECT * FROM notas_fiscais
       WHERE user_id = $1
       ORDER BY data_emissao DESC`,
      [session.user.id]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const {
      data_emissao,
      data_inicio,
      data_fim,
      salario,
      valor_refeicao,
      valor_transporte,
      valor_das,
      dias_trabalhados,
      valor_total_refeicao,
      valor_total_transporte,
      valor_total,
      cnpj,
      tipo,
      numero_nota,
      descricao,
    } = await request.json();

    const db = await getDatabase();
    const result = await db.query(
      `INSERT INTO notas_fiscais (
        user_id, data_emissao, data_inicio, data_fim, salario,
        valor_refeicao, valor_transporte, valor_das, dias_trabalhados,
        valor_total_refeicao, valor_total_transporte, valor_total, cnpj,
        tipo, numero_nota, descricao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id`,
      [
        session.user.id, data_emissao, data_inicio, data_fim, salario,
        valor_refeicao, valor_transporte, valor_das, dias_trabalhados,
        valor_total_refeicao, valor_total_transporte, valor_total, cnpj,
        tipo || 'manual', numero_nota || null, descricao || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Nota fiscal criada com sucesso',
      id: result.rows[0].id
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}