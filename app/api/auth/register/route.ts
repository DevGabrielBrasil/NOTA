import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  const { email, password, nome, cnpj } = await request.json();

  if (!email || !password || !nome || !cnpj) {
    return NextResponse.json(
      { error: 'Todos os campos são obrigatórios' },
      { status: 400 }
    );
  }

  try {
    const db = await getDatabase();
    
    // Verificar se o usuário já existe
    const existingUser = await db.get(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      );
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const result = await db.run(
      `INSERT INTO usuarios (email, nome, cnpj, senha_hash) 
       VALUES (?, ?, ?, ?)`,
      [email, nome, cnpj, hashedPassword]
    );

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      userId: result.lastID
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}