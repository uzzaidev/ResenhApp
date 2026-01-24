# 📁 Documentação V2.0 - Sistema Atléticas

> **Pasta dedicada ao planejamento e execução do ResenhApp V2.0**  
> **Transformação:** Peladeiros → Sistema Completo de Gestão Esportiva

---

## 📚 Documentos Disponíveis

### 1. [PLANO-EXECUCAO-COMPLETO.md](./PLANO-EXECUCAO-COMPLETO.md)
**Plano detalhado passo a passo** para implementação de todas as features do sistema de atléticas.

**Conteúdo:**
- Análise completa do sistema de referência (HTML)
- Mapeamento features HTML → ResenhApp
- Plano de execução por 9 sprints (18 semanas)
- Detalhamento técnico de cada feature
- Checklist completo de implementação

**Status:** ✅ Completo

### 2. [ARQUITETURA-HIERARQUIA-CREDITOS.md](./ARQUITETURA-HIERARQUIA-CREDITOS.md)
**Arquitetura completa de hierarquia, créditos e dois nichos do sistema.**

**Conteúdo:**
- Hierarquia de usuários (Atlética → Grupo → Usuário)
- Sistema de créditos (compra, consumo, saldo)
- Dois nichos (Atléticas vs Peladas)
- Sistema de permissões hierárquicas
- Sistema financeiro hierárquico (Pix)
- Migrations necessárias

**Status:** ✅ Completo

---

## 🎯 Objetivo do V2.0

Transformar o **ResenhApp** em um **sistema completo de gestão esportiva** que atende **dois nichos**:

### Nicho 1: Atléticas (Sistema Completo)
1. ✅ Gerenciar múltiplas modalidades (Futsal, Vôlei, Basquete, Handebol, Campo)
2. ✅ Gestão avançada de atletas com múltiplas modalidades
3. ✅ Sistema de treinos com RSVP, recorrentes e pagamentos
4. ✅ Jogos oficiais com convocações
5. ✅ Financeiro completo com pagamentos por treino
6. ✅ Frequência com QR Code check-in
7. ✅ Rankings por modalidade
8. ✅ Tabelinha tática interativa

### Nicho 2: Peladas (Sistema Simples)
1. ✅ Grupos de pessoas para jogos
2. ✅ Confirmações (RSVP)
3. ✅ Sorteio de times
4. ✅ Rankings básicos
5. ✅ Pagamentos simples
6. ✅ Frequência básica

### Sistema Base
- ✅ **Hierarquia:** Atlética → Grupos → Usuários
- ✅ **Créditos:** Sistema de créditos para features premium
- ✅ **Permissões:** Baseadas em níveis hierárquicos
- ✅ **Financeiro:** Pagamentos hierárquicos (Pix da atlética ou grupo)

---

## 📊 Status do Projeto

| Fase | Status | Progresso |
|------|--------|-----------|
| **Fase 0: Preparação** | ⏸️ Planejado | 0% |
| **Fase 1: Modalidades e Atletas** | ⏸️ Planejado | 0% |
| **Fase 2: Treinos Avançados** | ⏸️ Planejado | 0% |
| **Fase 3: Financeiro** | ⏸️ Planejado | 0% |
| **Fase 4: Jogos Oficiais** | ⏸️ Planejado | 0% |
| **Fase 5: Frequência** | ⏸️ Planejado | 0% |
| **Fase 6: Rankings** | ⏸️ Planejado | 0% |
| **Fase 7: Tabelinha Tática** | ⏸️ Planejado | 0% |
| **Fase 8: Dashboard** | ⏸️ Planejado | 0% |

**Timeline Total:** 18 semanas (4.5 meses)

---

## 🔗 Documentos Relacionados

### Arquitetura
- [`docs/02-architecture/SYSTEM_V2.md`](../02-architecture/SYSTEM_V2.md) - Arquitetura completa V2.0
- [`docs/02-architecture/INTEGRACAO-FEATURES-SISTEMA.md`](../02-architecture/INTEGRACAO-FEATURES-SISTEMA.md) - Integração de features

### Planejamento
- [`docs/14-planning/PROXIMOS-PASSOS-DESENVOLVIMENTO.md`](../14-planning/PROXIMOS-PASSOS-DESENVOLVIMENTO.md) - Próximos passos gerais
- [`docs/14-planning/ESTRATEGIA-IMPLEMENTACAO-INCREMENTAL.md`](../14-planning/ESTRATEGIA-IMPLEMENTACAO-INCREMENTAL.md) - Estratégia incremental

### Database
- [`supabase/migrations/`](../../supabase/migrations/) - Migrations V2.0
- [`supabase/README.md`](../../supabase/README.md) - Documentação Supabase

### Fases Documentadas
- [`docs/17-fases_documentadas/README.md`](../17-fases_documentadas/README.md) - Índice de todas as fases
- [`docs/17-fases_documentadas/FASE-ATUAL.md`](../17-fases_documentadas/FASE-ATUAL.md) - Documento vivo da fase em andamento
- [`docs/17-fases_documentadas/FASE-00-PREPARACAO-FUNDACAO.md`](../17-fases_documentadas/FASE-00-PREPARACAO-FUNDACAO.md) - Fase 0 (Detalhada)

---

## 🚀 Próximos Passos

1. **Revisar** o `PLANO-EXECUCAO-COMPLETO.md`
2. **Validar** com a equipe as prioridades
3. **Iniciar Fase 0** - Preparação e Fundação
4. **Aplicar migrations** das novas tabelas
5. **Começar Fase 1** - Modalidades e Atletas

---

**Última atualização:** 2026-02-27  
**Responsável:** Equipe ResenhApp

