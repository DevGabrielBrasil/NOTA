# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Sistema de Gestão de Notas Fiscais MEI! Este documento fornece diretrizes para contribuições.

## 📋 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## 🚀 Como Contribuir

### 1. Reportar Bugs
- Use o template de issue para bugs
- Inclua passos detalhados para reproduzir
- Adicione screenshots quando relevante
- Especifique seu ambiente (OS, browser, versão)

### 2. Sugerir Melhorias
- Use o template de issue para features
- Explique o problema que a feature resolve
- Descreva a solução proposta
- Considere alternativas

### 3. Contribuir com Código

#### Setup do Ambiente
```bash
# 1. Fork e clone o repositório
git clone https://github.com/SEU-USUARIO/NOTA.git
cd NOTA

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 4. Execute migrações
npm run db:migrate

# 5. Inicie desenvolvimento
npm run dev
```

#### Padrões de Código
- **TypeScript**: Use tipagem estrita
- **ESLint/Biome**: Siga as regras configuradas
- **Commits**: Use conventional commits
- **Testes**: Adicione testes para novas features

#### Estrutura de Commits
```
tipo(escopo): descrição

feat(auth): adicionar login com Google
fix(dashboard): corrigir cálculo de DAS
docs(readme): atualizar instruções de instalação
style(ui): ajustar espaçamento dos botões
refactor(api): simplificar validação de CNPJ
test(utils): adicionar testes para formatadores
chore(deps): atualizar dependências
```

#### Processo de Pull Request
1. Crie uma branch descritiva: `git checkout -b feat/nova-funcionalidade`
2. Faça commits pequenos e focados
3. Execute testes: `npm run test`
4. Execute linting: `npm run lint`
5. Atualize documentação se necessário
6. Abra PR com descrição detalhada

### 4. Melhorar Documentação
- Corrija erros de digitação
- Adicione exemplos práticos
- Traduza conteúdo
- Melhore explicações técnicas

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas
```
app/                 # App Router (Next.js 13+)
├── api/            # API Routes
├── dashboard/      # Páginas autenticadas
├── (auth)/         # Páginas de autenticação
└── globals.css     # Estilos globais

components/         # Componentes React
├── ui/            # Componentes base (Shadcn)
├── forms/         # Formulários específicos
└── charts/        # Componentes de gráficos

lib/               # Configurações e utilitários
├── database.ts    # Conexão com banco
├── auth.ts        # Configuração NextAuth
└── validations.ts # Schemas Zod

types/             # Definições TypeScript
hooks/             # Custom hooks
contexts/          # React contexts
actions/           # Server actions
utils/             # Funções utilitárias
```

### Padrões de Desenvolvimento

#### Componentes React
```typescript
// ✅ Bom
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant, children, onClick }: ButtonProps) {
  return (
    <button 
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ❌ Evitar
export function Button(props: any) {
  return <button {...props} />;
}
```

#### API Routes
```typescript
// ✅ Bom
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createNotaSchema = z.object({
  salario: z.number().positive(),
  periodo: z.object({
    inicio: z.string().datetime(),
    fim: z.string().datetime(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createNotaSchema.parse(body);
    
    // Lógica de criação
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Dados inválidos' }, 
      { status: 400 }
    );
  }
}
```

#### Validação com Zod
```typescript
// ✅ Bom
const userSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
});

// ❌ Evitar validação manual
if (!nome || nome.length < 2) {
  throw new Error('Nome inválido');
}
```

## 🧪 Testes

### Executar Testes
```bash
npm run test          # Todos os testes
npm run test:watch    # Modo watch
npm run test:coverage # Com coverage
```

### Escrever Testes
```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📦 Releases

### Versionamento
Seguimos [Semantic Versioning](https://semver.org/):
- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

### Processo de Release
1. Atualize CHANGELOG.md
2. Bump version no package.json
3. Crie tag: `git tag v1.2.3`
4. Push tags: `git push --tags`
5. GitHub Actions criará release automaticamente

## 🎯 Áreas que Precisam de Ajuda

### 🔴 Alta Prioridade
- [ ] Testes unitários para componentes
- [ ] Documentação da API
- [ ] Otimização de performance
- [ ] Acessibilidade (a11y)

### 🟡 Média Prioridade
- [ ] Internacionalização (i18n)
- [ ] Temas personalizáveis
- [ ] PWA (Progressive Web App)
- [ ] Integração com contadores

### 🟢 Baixa Prioridade
- [ ] Storybook para componentes
- [ ] E2E tests com Playwright
- [ ] Docker para desenvolvimento
- [ ] CI/CD melhorado

## 💬 Comunicação

### Canais
- **Issues**: Para bugs e features
- **Discussions**: Para perguntas e ideias
- **Email**: contato@gabrielbrasil.dev

### Respondemos em
- Issues: 24-48 horas
- Pull Requests: 2-5 dias
- Discussions: 1-3 dias

## 🏆 Reconhecimento

Contribuidores são reconhecidos:
- README.md (seção Contributors)
- CHANGELOG.md nas releases
- Menção em redes sociais
- Convite para equipe (contribuidores ativos)

## ❓ Dúvidas?

Não hesite em:
- Abrir uma Discussion
- Comentar em issues existentes
- Enviar email para contato@gabrielbrasil.dev

**Obrigado por contribuir! 🚀**