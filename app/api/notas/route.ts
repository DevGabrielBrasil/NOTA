import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDatabase } from '@/lib/database';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const notas = await db.all(
      `SELECT * FROM notas_fiscais 
       WHERE user_id = ? 
       ORDER BY data_emissao DESC`,
      [session.user.id]
    );

    return NextResponse.json({ success: true, data: notas });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
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
      cnpj
    } = await request.json();

    const db = await getDatabase();
    const result = await db.run(
      `INSERT INTO notas_fiscais (
        user_id, data_emissao, data_inicio, data_fim, salario,
        valor_refeicao, valor_transporte, valor_das, dias_trabalhados,
        valor_total_refeicao, valor_total_transporte, valor_total, cnpj
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.user.id, data_emissao, data_inicio, data_fim, salario,
        valor_refeicao, valor_transporte, valor_das, dias_trabalhados,
        valor_total_refeicao, valor_total_transporte, valor_total, cnpj
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Nota fiscal criada com sucesso',
      id: result.lastID
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}