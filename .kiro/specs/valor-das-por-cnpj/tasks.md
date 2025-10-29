# Plano de Implementação - Valor DAS por CNPJ

- [ ] 1. Criar estrutura de banco de dados para configurações de DAS
  - Criar script SQL para as novas tabelas (cnpj_das_config, das_valores_base, das_historico_alteracoes)
  - Implementar índices otimizados para consultas por CNPJ e ano
  - Criar script de migração para dados existentes
  - _Requisitos: 1.2, 2.1, 5.1, 5.4_

- [ ] 2. Implementar tipos TypeScript e interfaces
  - Criar arquivo types/das-config.ts com interfaces CNPJDASConfig, DASValorBase, DASHistoricoAlteracao
  - Atualizar tipos existentes para incluir configurações de DAS
  - Definir tipos para requests e responses das APIs
  - _Requisitos: 5.2, 5.3_

- [ ] 3. Desenvolver serviço de configuração de DAS
  - Implementar DASConfigService com métodos CRUD para configurações
  - Criar método getDASConfigByCNPJ para buscar valor específico por CNPJ
  - Implementar upsertDASConfig para criar/atualizar configurações
  - Adicionar método getHistoricoAlteracoes para consultar histórico
  - _Requisitos: 1.1, 1.2, 1.4, 2.4, 4.2, 4.5_

- [ ] 4. Criar mapeador de atividades CNPJ
  - Implementar CNPJActivityMapper para mapear CNAE para tipos de atividade
  - Criar método getValorBasePorCNAE para determinar valor sugerido
  - Integrar com API BrasilAPI para obter informações de atividade
  - Implementar cache para consultas frequentes
  - _Requisitos: 1.1, 2.1_

- [ ] 5. Implementar APIs REST para gerenciamento de DAS
  - Criar API route /api/das/config para gerenciar configurações por usuário
  - Implementar /api/das/valores-base para administração de valores base
  - Criar /api/das/historico para consultar histórico de alterações
  - Adicionar validação de dados com Zod
  - Implementar middleware de autenticação para todas as rotas
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 2.2, 2.3_

- [ ] 6. Atualizar componente de formulário de nota fiscal
  - Modificar nota-fiscal-form-simplificado.tsx para buscar valor DAS automaticamente
  - Implementar preenchimento automático do campo valor_das baseado no CNPJ do usuário
  - Permitir edição manual do valor com indicação do valor sugerido
  - Recalcular valor total quando valor DAS for alterado
  - _Requisitos: 3.1, 3.2, 3.4_

- [ ] 7. Criar página de configuração de DAS
  - Implementar app/dashboard/das/configuracao/page.tsx
  - Criar formulário para visualizar e editar valor DAS do usuário
  - Exibir valor atual, valor sugerido baseado na atividade, e histórico
  - Implementar validação e confirmação para alterações
  - Adicionar campo de justificativa para mudanças
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Desenvolver componente de input de valor DAS
  - Criar components/das-value-input.tsx reutilizável
  - Implementar sugestão de valor baseada no tipo de atividade
  - Adicionar validação de valores (não negativos, limites razoáveis)
  - Incluir tooltip com informações sobre o valor sugerido
  - _Requisitos: 1.4, 4.2_

- [ ] 9. Atualizar página DAS existente
  - Modificar app/dashboard/das/page.tsx para usar valor específico do usuário
  - Substituir valor fixo pela consulta ao DASConfigService
  - Adicionar link para página de configuração
  - Manter compatibilidade com calculadora existente
  - _Requisitos: 1.3, 5.3_

- [ ] 10. Implementar script de migração de dados
  - Criar script para migrar dados existentes para nova estrutura
  - Inserir configurações padrão para todos os CNPJs cadastrados
  - Preservar todas as notas fiscais existentes
  - Implementar rollback em caso de erro na migração
  - _Requisitos: 5.1, 5.4_

- [ ] 11. Atualizar ações do CNPJ para incluir valor DAS
  - Modificar actions/cnpj-actions.ts para retornar valor DAS sugerido
  - Integrar com CNPJActivityMapper para determinar valor baseado na atividade
  - Manter função calcularDasMEI existente como fallback
  - _Requisitos: 1.1, 5.3_

- [ ]* 12. Implementar testes para novos componentes
  - Criar testes unitários para DASConfigService
  - Testar CNPJActivityMapper com diferentes tipos de CNAE
  - Implementar testes de integração para APIs de DAS
  - Testar componentes React com diferentes cenários de dados
  - _Requisitos: Todos os requisitos_

- [ ] 13. Executar migração e validação final
  - Executar script de migração em ambiente de desenvolvimento
  - Validar que todos os CNPJs existentes têm configuração padrão
  - Testar fluxo completo de criação de nota fiscal com novo valor DAS
  - Verificar que calculadora DAS usa valores específicos por usuário
  - _Requisitos: 5.1, 5.4, 5.5_