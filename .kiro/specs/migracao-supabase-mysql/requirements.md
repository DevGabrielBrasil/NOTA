# Requisitos - Migração do Supabase para MySQL Local

## Introdução

Este documento especifica os requisitos para migrar o sistema de gestão de notas fiscais do Supabase para um banco de dados MySQL local usando XAMPP. A migração deve manter toda a funcionalidade existente, incluindo autenticação de usuários, gestão de notas fiscais e configurações, enquanto remove a dependência do Supabase.

## Glossário

- **Sistema_Gestao_Notas**: O sistema web de gestão de notas fiscais desenvolvido em Next.js
- **MySQL_Local**: Banco de dados MySQL executando localmente via XAMPP
- **XAMPP**: Pacote de software que inclui Apache, MySQL, PHP e Perl
- **Autenticacao_Local**: Sistema de autenticação baseado em sessões locais substituindo o Supabase Auth
- **Migracao_Dados**: Processo de transferência de dados do Supabase para MySQL local
- **API_Routes**: Rotas de API do Next.js para operações de banco de dados
- **Middleware_Auth**: Middleware para verificação de autenticação em rotas protegidas

## Requisitos

### Requisito 1

**User Story:** Como desenvolvedor, quero migrar do Supabase para MySQL local, para que o sistema funcione completamente offline sem dependências externas.

#### Critérios de Aceitação

1. QUANDO o sistema for iniciado, O Sistema_Gestao_Notas DEVE conectar-se ao MySQL_Local via XAMPP
2. O Sistema_Gestao_Notas DEVE remover todas as dependências do Supabase do código
3. O Sistema_Gestao_Notas DEVE manter a mesma estrutura de dados existente no MySQL_Local
4. O Sistema_Gestao_Notas DEVE funcionar completamente offline após a migração
5. QUANDO a migração for concluída, O Sistema_Gestao_Notas DEVE preservar todos os dados existentes

### Requisito 2

**User Story:** Como usuário, quero fazer login no sistema, para que eu possa acessar minhas notas fiscais com autenticação local.

#### Critérios de Aceitação

1. QUANDO um usuário inserir credenciais válidas, O Sistema_Gestao_Notas DEVE autenticar via Autenticacao_Local
2. O Sistema_Gestao_Notas DEVE criar e gerenciar sessões de usuário localmente
3. QUANDO um usuário não estiver autenticado, O Sistema_Gestao_Notas DEVE redirecionar para a página de login
4. O Sistema_Gestao_Notas DEVE permitir registro de novos usuários com email, senha, nome e CNPJ
5. QUANDO um usuário fizer logout, O Sistema_Gestao_Notas DEVE invalidar a sessão local

### Requisito 3

**User Story:** Como usuário, quero gerenciar minhas notas fiscais, para que eu possa criar, visualizar, editar e excluir notas no banco local.

#### Critérios de Aceitação

1. QUANDO um usuário autenticado acessar o dashboard, O Sistema_Gestao_Notas DEVE exibir suas notas fiscais do MySQL_Local
2. O Sistema_Gestao_Notas DEVE permitir criação de novas notas fiscais no MySQL_Local
3. O Sistema_Gestao_Notas DEVE permitir edição de notas fiscais existentes no MySQL_Local
4. O Sistema_Gestao_Notas DEVE permitir exclusão de notas fiscais do MySQL_Local
5. QUANDO dados forem modificados, O Sistema_Gestao_Notas DEVE persistir as alterações no MySQL_Local

### Requisito 4

**User Story:** Como desenvolvedor, quero implementar API Routes do Next.js, para que o sistema se comunique com o MySQL local sem dependências externas.

#### Critérios de Aceitação

1. O Sistema_Gestao_Notas DEVE implementar API_Routes para todas as operações de banco de dados
2. QUANDO uma API_Routes for chamada, O Sistema_Gestao_Notas DEVE executar operações no MySQL_Local
3. O Sistema_Gestao_Notas DEVE implementar Middleware_Auth para proteger rotas sensíveis
4. QUANDO ocorrer um erro de banco, O Sistema_Gestao_Notas DEVE retornar mensagens de erro apropriadas
5. O Sistema_Gestao_Notas DEVE validar todos os dados de entrada nas API_Routes

### Requisito 5

**User Story:** Como usuário, quero que o sistema mantenha todas as funcionalidades existentes, para que não haja perda de recursos após a migração.

#### Critérios de Aceitação

1. O Sistema_Gestao_Notas DEVE manter a funcionalidade de busca de CNPJ via API externa
2. O Sistema_Gestao_Notas DEVE manter o cálculo automático do DAS para MEI
3. O Sistema_Gestao_Notas DEVE manter a geração de relatórios em PDF
4. O Sistema_Gestao_Notas DEVE manter a interface de usuário existente
5. QUANDO um usuário utilizar qualquer funcionalidade, O Sistema_Gestao_Notas DEVE comportar-se identicamente ao sistema anterior