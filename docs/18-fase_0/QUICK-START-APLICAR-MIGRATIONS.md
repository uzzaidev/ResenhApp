# ⚡ Quick Start: Aplicar Migrations V2.0

> **Guia rápido para aplicar todas as 8 migrations**

---

## 🎯 RESUMO RÁPIDO

**Total de migrations:** 8  
**Tempo estimado:** 15-30 minutos  
**Ordem:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

---

## 📋 CHECKLIST RÁPIDO

### Pré-requisitos
- [ ] Backup do banco feito
- [ ] Supabase Dashboard aberto
- [ ] SQL Editor aberto

### Migrations
- [ ] **Migration 1:** Sport Modalities
- [ ] **Migration 2:** Athlete Modalities  
- [ ] **Migration 3:** Recurring Trainings
- [ ] **Migration 4:** Game Convocations
- [ ] **Migration 5:** Check-in QR Codes
- [ ] **Migration 6:** Saved Tactics
- [ ] **Migration 7:** Financial by Training
- [ ] **Migration 8:** Hierarchy and Credits ⭐

### Validação Final
- [ ] Script de validação executado
- [ ] Todas as tabelas criadas (9)
- [ ] Todas as funções criadas (14+)
- [ ] Nenhum erro encontrado

---

## 🚀 PASSO A PASSO

### 1. Abrir Supabase SQL Editor
```
https://app.supabase.com → Seu Projeto → SQL Editor → New Query
```

### 2. Para cada migration (1-8):

**a) Copiar conteúdo:**
```
Arquivo: supabase/migrations/2026022700000X_[nome].sql
Ação: Ctrl+A → Ctrl+C
```

**b) Colar no SQL Editor:**
```
Ação: Ctrl+V
```

**c) Executar:**
```
Ação: Clique em "Run" ou Ctrl+Enter
```

**d) Verificar:**
```
Resultado esperado: "Success. No rows returned"
Se houver erro: Anotar mensagem
```

### 3. Após todas as migrations:

**Executar script de validação:**
```sql
-- Ver arquivo: docs/18-fase_0/TESTE-MIGRATIONS.md
-- Seção: "Validação Completa"
```

---

## 📝 ARQUIVOS DAS MIGRATIONS

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `20260227000001_sport_modalities.sql` | Tabela de modalidades |
| 2 | `20260227000002_athlete_modalities.sql` | Relacionamento atleta-modalidade |
| 3 | `20260227000003_recurring_trainings.sql` | Treinos recorrentes |
| 4 | `20260227000004_game_convocations.sql` | Convocações de jogos |
| 5 | `20260227000005_checkin_qrcodes.sql` | Check-in QR Code |
| 6 | `20260227000006_saved_tactics.sql` | Táticas salvas |
| 7 | `20260227000007_financial_by_training.sql` | Financeiro por treino |
| 8 | `20260227000008_hierarchy_and_credits.sql` | Hierarquia e créditos ⭐ |

---

## ✅ RESULTADO ESPERADO

Após aplicar todas as migrations:

- ✅ **9 novas tabelas** criadas
- ✅ **6 colunas** adicionadas em `groups`
- ✅ **5 colunas** adicionadas em `events`
- ✅ **1 coluna** adicionada em `charges`
- ✅ **2 views** criadas
- ✅ **14+ funções** criadas
- ✅ **Nenhum erro**

---

## 🐛 PROBLEMAS COMUNS

### "relation already exists"
→ Migration já aplicada, pular para próxima

### "column does not exist"
→ Verificar se migration anterior foi aplicada

### "type mismatch"
→ Verificar se está usando tipos corretos (BIGINT/UUID)

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Guia detalhado:** `docs/18-fase_0/GUIA-TESTE-PASSO-A-PASSO.md`
- **Teste migrations:** `docs/18-fase_0/TESTE-MIGRATIONS.md`
- **Checklist:** `docs/18-fase_0/CHECKLIST-EXECUCAO.md`

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Pronto para aplicação






