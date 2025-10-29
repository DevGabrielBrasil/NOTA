# Design - Migração do Supabase para MySQL Local

## Visão Geral

Este documento detalha o design técnico para migrar o sistema de gestão de notas fiscais do Supabase para um banco de dados MySQL local usando XAMPP. A migração envolve a substituição completa da infraestrutura de backend, mantendo a interface e funcionalidades existentes.

## Arquitetura

### Arquitetura Atual (Supabase)
```
Next.js App → Supabase Client → Supabase Cloud (PostgreSQL + Auth)
```

### Nova Arquitetura (MySQL Local)
```
Next.js App → API Routes → MySQL2 Driver → MySQL Local (XAMPP)
                ↓
            NextAuth.js (Autenticação Local)
                ↓
            Middleware de Sessão
```

### Componentes Principais

1. **Camada de Dados**: MySQL local via XAMPP
2. **Camada de API**: Next.js API Routes com mysql2
3. **Autenticação**: NextAuth.js com CredentialsProvider
4. **Middleware**: Proteção de rotas e validação de sessão
5. **Cliente**: React hooks customizados para API calls

## Componentes e Interfaces

### 1. Configuração do Banco de Dados

**MySQL Connection Pool**
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}
```

**Estrutura de Tabelas MySQL**
- `usuarios`: Dados dos usuários (id, email, nome, cnpj, senha_hash)
- `notas_fiscais`: Notas fiscais (mantém estrutura atual)
- `configuracoes`: Configurações do usuário (mantém estrutura atual)
- `sessoes`: Sessões de usuário (para NextAuth.js)

### 2. Sistema de Autenticação

**NextAuth.js Configuration**
```typescript
interface AuthConfig {
  providers: [CredentialsProvider];
  session: { strategy: "jwt" };
  callbacks: {
    jwt: (token, user) => Promise<JWT>;
    session: (session, token) => Promise<Session>;
  };
}
```

**Password Hashing**
- Biblioteca: bcryptjs
- Salt rounds: 12
- Validação: comparação segura de hashes

### 3. API Routes Structure

**Estrutura de Rotas**
```
/api/
├── auth/
│   ├── [...nextauth].ts (NextAuth.js)
│   ├── register.ts (Registro de usuários)
│   └── me.ts (Dados do usuário atual)
├── notas/
│   ├── index.ts (GET/POST notas)
│   ├── [id].ts (GET/PUT/DELETE nota específica)
│   └── export.ts (Exportação PDF)
├── cnpj/
│   └── buscar.ts (Busca CNPJ - mantém atual)
└── configuracoes/
    └── index.ts (GET/PUT configurações)
```

### 4. Data Access Layer

**Repository Pattern**
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(userId: string): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
```

**Implementações**
- `UserRepository`: Operações de usuário
- `NotaFiscalRepository`: Operações de notas fiscais
- `ConfiguracaoRepository`: Operações de configurações

## Modelos de Dados

### Schema MySQL

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de notas fiscais (adaptada do Supabase)
CREATE TABLE notas_fiscais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  data_emissao DATE NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  salario DECIMAL(10,2) NOT NULL,
  valor_refeicao DECIMAL(10,2) NOT NULL,
  valor_transporte DECIMAL(10,2) NOT NULL,
  valor_das DECIMAL(10,2) DEFAULT 0,
  dias_trabalhados INT NOT NULL,
  valor_total_refeicao DECIMAL(10,2) NOT NULL,
  valor_total_transporte DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  cnpj VARCHAR(18),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de configurações
CREATE TABLE configuracoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  limite_faturamento_anual DECIMAL(12,2) DEFAULT 81000.00,
  ano_fiscal INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_ano (user_id, ano_fiscal),
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

### TypeScript Interfaces

```typescript
interface Usuario {
  id: string;
  email: string;
  nome: string;
  cnpj: string;
  created_at: Date;
  updated_at: Date;
}

interface NotaFiscal {
  id: number;
  user_id: string;
  data_emissao: string;
  data_inicio: string;
  data_fim: string;
  salario: number;
  valor_refeicao: number;
  valor_transporte: number;
  valor_das: number;
  dias_trabalhados: number;
  valor_total_refeicao: number;
  valor_total_transporte: number;
  valor_total: number;
  cnpj?: string;
  created_at: Date;
}
```

## Tratamento de Erros

### Estratégia de Error Handling

1. **Database Errors**: Captura e log de erros MySQL
2. **Authentication Errors**: Mensagens padronizadas para falhas de auth
3. **Validation Errors**: Validação de entrada com Zod
4. **Network Errors**: Retry logic para operações críticas

### Error Response Format

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}
```

## Estratégia de Testes

### Tipos de Testes

1. **Unit Tests**: Repositories e utilitários
2. **Integration Tests**: API Routes com banco de teste
3. **E2E Tests**: Fluxos críticos de usuário

### Ferramentas de Teste

- **Jest**: Framework de testes
- **Supertest**: Testes de API
- **MySQL Memory Server**: Banco em memória para testes
- **Testing Library**: Testes de componentes React

### Cobertura de Testes

- Autenticação: Login, registro, middleware
- CRUD de notas fiscais: Todas as operações
- Validações: Entrada de dados e regras de negócio
- Error handling: Cenários de falha

## Plano de Migração de Dados

### Fase 1: Preparação
1. Setup do ambiente MySQL local
2. Criação das tabelas e índices
3. Configuração das conexões

### Fase 2: Migração de Dados
1. Export dos dados do Supabase
2. Transformação dos dados (UUID → VARCHAR, etc.)
3. Import para MySQL local
4. Validação da integridade dos dados

### Fase 3: Implementação
1. Substituição gradual dos componentes
2. Testes de integração
3. Validação das funcionalidades

### Fase 4: Finalização
1. Remoção das dependências do Supabase
2. Cleanup do código
3. Documentação final

## Considerações de Segurança

### Autenticação e Autorização
- Hashing seguro de senhas com bcrypt
- Tokens JWT com expiração adequada
- Middleware de autenticação em todas as rotas protegidas
- Validação de propriedade de recursos (user_id)

### Proteção de Dados
- Sanitização de inputs
- Prepared statements para prevenir SQL injection
- Rate limiting nas APIs
- HTTPS obrigatório em produção

### Configuração Segura
- Variáveis de ambiente para credenciais
- Conexões de banco com SSL (quando disponível)
- Logs de segurança para auditoria

## Dependências Técnicas

### Novas Dependências
```json
{
  "mysql2": "^3.6.0",
  "next-auth": "^4.24.0",
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.4"
}
```

### Dependências Removidas
```json
{
  "@supabase/supabase-js": "^2.49.4",
  "@supabase/ssr": "^0.6.1"
}
```

## Performance e Otimização

### Database Optimization
- Índices apropriados nas tabelas
- Connection pooling
- Query optimization
- Paginação para listagens grandes

### Caching Strategy
- Cache de sessão em memória
- Cache de configurações do usuário
- Invalidação inteligente de cache

### Monitoring
- Logs estruturados
- Métricas de performance
- Health checks das conexões de banco