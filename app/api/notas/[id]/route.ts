import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDatabase } from '@/lib/database';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = await getDatabase();
          const user = await db.get(
            'SELECT * FROM usuarios WHERE email = ?',
            [credentials.email]
          );

          if (!user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.senha_hash
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.nome,
            cnpj: user.cnpj
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.cnpj = user.cnpj;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.cnpj = token.cnpj;
      }
      return session;
    }
  }
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const { id } = await params; // Aguardar params

    // Verificar se a nota pertence ao usuário
    const nota = await db.get(
      'SELECT user_id FROM notas_fiscais WHERE id = ?',
      [id]
    );

    if (!nota) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Converter ambos para string para comparação
    if (nota.user_id.toString() !== session.user.id.toString()) {
      return NextResponse.json(
        { error: 'Não autorizado a deletar esta nota' },
        { status: 403 }
      );
    }

    // Deletar a nota
    await db.run('DELETE FROM notas_fiscais WHERE id = ?', [id]);

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