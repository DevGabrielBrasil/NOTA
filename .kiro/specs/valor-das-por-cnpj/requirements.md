# Documento de Requisitos - Valor DAS por CNPJ

## Introdução

Este documento especifica os requisitos para implementar um sistema que armazene e gerencie valores específicos do DAS (Documento de Arrecadação do Simples Nacional) para cada CNPJ cadastrado no sistema, substituindo o valor fixo atual por valores personalizados baseados no tipo de atividade e ano de referência.

## Glossário

- **Sistema_Gestao_Notas**: Sistema principal de gestão de notas fiscais
- **DAS_Manager**: Componente responsável por gerenciar valores do DAS por CNPJ
- **CNPJ_Config**: Configuração específica de cada CNPJ incluindo valor do DAS
- **Valor_DAS**: Valor mensal do DAS específico para cada CNPJ
- **API_BrasilAPI**: API externa para consulta de informações de CNPJ
- **Database_Local**: Banco de dados MySQL local do sistema

## Requisitos

### Requisito 1

**User Story:** Como usuário do sistema, quero que o valor do DAS seja específico para cada CNPJ cadastrado, para que os cálculos sejam precisos conforme o tipo de atividade da empresa.

#### Critérios de Aceitação

1. QUANDO um usuário cadastrar um novo CNPJ, O Sistema_Gestao_Notas DEVE consultar a API_BrasilAPI para determinar o tipo de atividade
2. O Sistema_Gestao_Notas DEVE armazenar o valor específico do DAS para cada CNPJ no Database_Local
3. QUANDO um usuário acessar a calculadora DAS, O Sistema_Gestao_Notas DEVE exibir o valor correto baseado no CNPJ do usuário logado
4. O Sistema_Gestao_Notas DEVE permitir atualização manual do valor do DAS por CNPJ
5. QUANDO não houver valor específico cadastrado, O Sistema_Gestao_Notas DEVE usar o valor padrão de R$ 70,60

### Requisito 2

**User Story:** Como administrador do sistema, quero poder configurar e atualizar os valores do DAS para diferentes tipos de atividade, para manter os valores sempre atualizados conforme as mudanças da legislação.

#### Critérios de Aceitação

1. O Sistema_Gestao_Notas DEVE criar uma tabela para armazenar configurações de DAS por tipo de atividade
2. QUANDO um administrador atualizar um valor base de DAS, O Sistema_Gestao_Notas DEVE aplicar a mudança para todos os CNPJs do mesmo tipo
3. O Sistema_Gestao_Notas DEVE manter histórico de alterações nos valores do DAS
4. QUANDO um valor for alterado, O Sistema_Gestao_Notas DEVE registrar data, usuário e valor anterior

### Requisito 3

**User Story:** Como usuário, quero que o sistema calcule automaticamente o valor correto do DAS nas notas fiscais, para que não precise inserir manualmente o valor a cada nota.

#### Critérios de Aceitação

1. QUANDO um usuário criar uma nova nota fiscal, O Sistema_Gestao_Notas DEVE preencher automaticamente o campo valor_das com o valor específico do CNPJ
2. O Sistema_Gestao_Notas DEVE permitir edição manual do valor do DAS na nota fiscal
3. QUANDO o valor do DAS for editado manualmente, O Sistema_Gestao_Notas DEVE manter o valor original como referência
4. O Sistema_Gestao_Notas DEVE recalcular o valor total da nota quando o valor do DAS for alterado

### Requisito 4

**User Story:** Como usuário, quero visualizar e gerenciar as configurações do DAS do meu CNPJ, para ter controle sobre os valores utilizados nos cálculos.

#### Critérios de Aceitação

1. O Sistema_Gestao_Notas DEVE criar uma página de configurações do DAS por usuário
2. QUANDO um usuário acessar as configurações, O Sistema_Gestao_Notas DEVE exibir o valor atual do DAS para seu CNPJ
3. O Sistema_Gestao_Notas DEVE permitir alteração do valor do DAS com justificativa
4. QUANDO um valor for alterado, O Sistema_Gestao_Notas DEVE solicitar confirmação do usuário
5. O Sistema_Gestao_Notas DEVE exibir o histórico de alterações do valor do DAS

### Requisito 5

**User Story:** Como desenvolvedor, quero que o sistema mantenha compatibilidade com a estrutura atual, para que a migração seja transparente aos usuários existentes.

#### Critérios de Aceitação

1. O Sistema_Gestao_Notas DEVE migrar automaticamente os dados existentes para a nova estrutura
2. QUANDO não houver valor específico para um CNPJ, O Sistema_Gestao_Notas DEVE usar o valor padrão atual (R$ 70,60)
3. O Sistema_Gestao_Notas DEVE manter a API atual de cálculo do DAS funcionando
4. QUANDO a migração for executada, O Sistema_Gestao_Notas DEVE preservar todas as notas fiscais existentes
5. O Sistema_Gestao_Notas DEVE atualizar automaticamente os componentes existentes para usar os novos valores