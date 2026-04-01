import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/database';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const { id } = await params;

    const notaResult = await db.query(
      'SELECT user_id FROM notas_fiscais WHERE id = $1',
      [id]
    );
    const nota = notaResult.rows[0];

    if (!nota) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    if (nota.user_id.toString() !== session.user.id.toString()) {
      return NextResponse.json(
        { error: 'Não autorizado a deletar esta nota' },
        { status: 403 }
      );
    }

    await db.query('DELETE FROM notas_fiscais WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'Nota fiscal deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
