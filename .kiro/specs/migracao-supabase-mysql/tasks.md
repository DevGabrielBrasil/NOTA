# Plano de Implementação - Migração Supabase para MySQL

- [x] 1. Configurar ambiente MySQL local e dependências



  - Instalar e configurar XAMPP com MySQL
  - Adicionar dependências mysql2, next-auth, bcryptjs ao package.json
  - Remover dependências do Supabase (@supabase/supabase-js, @supabase/ssr)
  - Criar arquivo de configuração de banco de dados

  - _Requisitos: 1.1, 1.2_

- [ ] 2. Criar estrutura do banco de dados MySQL
  - Criar script SQL para criação das tabelas (usuarios, notas_fiscais, configuracoes)
  - Implementar índices e chaves estrangeiras apropriadas
  - Criar script de inicialização do banco

  - Configurar connection pool para MySQL
  - _Requisitos: 1.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Implementar camada de acesso a dados (Repository Pattern)
  - Criar interface base Repository com operações CRUD
  - Implementar UserRepository para operações de usuário
  - Implementar NotaFiscalRepository para operações de notas fiscais

  - Implementar ConfiguracaoRepository para configurações
  - Criar utilitários de conexão e transação de banco
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Configurar sistema de autenticação local
  - Configurar NextAuth.js com CredentialsProvider
  - Implementar hashing de senhas com bcryptjs

  - Criar API route para registro de usuários (/api/auth/register)
  - Configurar callbacks JWT e session do NextAuth
  - Implementar middleware de autenticação para rotas protegidas
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Criar API Routes para operações de notas fiscais
  - Implementar /api/notas/index.ts (GET/POST notas fiscais)

  - Implementar /api/notas/[id].ts (GET/PUT/DELETE nota específica)
  - Adicionar validação de dados com Zod
  - Implementar verificação de propriedade de recursos (user_id)
  - Manter API route /api/cnpj/buscar.ts existente
  - _Requisitos: 4.1, 4.2, 4.4, 4.5_

- [x] 6. Migrar contextos e hooks do frontend


  - Substituir AuthContext para usar NextAuth.js
  - Atualizar useNotas hook para usar API Routes locais
  - Remover importações do supabase-client
  - Atualizar tipos TypeScript para remover dependências do Supabase
  - Implementar error handling para novas APIs
  - _Requisitos: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_


- [ ] 7. Implementar API Routes para configurações e usuário
  - Criar /api/configuracoes/index.ts (GET/PUT configurações)
  - Criar /api/auth/me.ts (dados do usuário atual)
  - Implementar validação e sanitização de dados
  - Adicionar tratamento de erros padronizado
  - _Requisitos: 4.1, 4.2, 4.4, 4.5_

- [ ] 8. Atualizar componentes para nova arquitetura
  - Modificar componentes de autenticação (login, registro)
  - Atualizar formulários de notas fiscais
  - Ajustar componentes de dashboard e navegação
  - Manter funcionalidade de geração de PDF
  - Preservar interface de usuário existente
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_



- [ ] 9. Implementar script de migração de dados
  - Criar script para exportar dados do Supabase
  - Implementar transformação de dados (UUID para VARCHAR, etc.)
  - Criar script de importação para MySQL
  - Implementar validação de integridade dos dados migrados
  - _Requisitos: 1.5_

- [ ] 10. Configurar variáveis de ambiente e deployment
  - Criar arquivo .env.example com variáveis necessárias
  - Configurar NEXTAUTH_SECRET e NEXTAUTH_URL
  - Configurar credenciais do banco MySQL local
  - Atualizar documentação de setup do projeto
  - _Requisitos: 1.1, 1.4_

- [ ]* 11. Implementar testes de integração
  - Criar testes para API Routes de autenticação
  - Implementar testes para operações CRUD de notas fiscais
  - Criar testes para repositories e utilitários de banco
  - Configurar banco de teste em memória
  - _Requisitos: 4.1, 4.2, 4.4, 4.5_

- [ ]* 12. Adicionar logging e monitoramento
  - Implementar logs estruturados para operações de banco
  - Adicionar métricas de performance
  - Criar health checks para conexões MySQL
  - Implementar auditoria de operações sensíveis
  - _Requisitos: 4.4_