# 🚀 Aplicar Migration 1: Sport Modalities

> **Guia passo a passo para aplicar a primeira migration**

---

## 📋 PRÉ-REQUISITOS

- [x] Backup do banco de dados feito
- [x] Acesso ao Supabase Dashboard
- [x] Migration corrigida e validada

---

## 🎯 PASSO 1: Abrir Supabase SQL Editor

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**

---

## 🎯 PASSO 2: Copiar Migration 1

1. Abra o arquivo: `supabase/migrations/20260227000001_sport_modalities.sql`
2. Selecione **TODO o conteúdo** (Ctrl+A)
3. Copie (Ctrl+C)

---

## 🎯 PASSO 3: Aplicar Migration

1. Cole o conteúdo no SQL Editor do Supabase
2. Verifique se o conteúdo está completo
3. Clique em **Run** (ou pressione Ctrl+Enter)

---

## 🎯 PASSO 4: Verificar Resultado

### 4.1 Verificar se não houve erros

**Resultado esperado:**
```
Success. No rows returned
```

Se houver erro, anote a mensagem e me avise.

### 4.2 Executar Script de Verificação

Cole e execute este script no SQL Editor:

```sql
-- Verificar se tabela foi criada
SELECT 
  'Tabela sport_modalities' AS verificação,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sport_modalities')
    THEN '✅ CRIADA'
    ELSE '❌ NÃO ENCONTRADA'
  END AS status;

-- Verificar colunas
SELECT 
  'Colunas da tabela' AS verificação,
  COUNT(*) AS total_colunas
FROM information_schema.columns 
WHERE table_name = 'sport_modalities';

-- Verificar função
SELECT 
  'Função get_group_modalities' AS verificação,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_group_modalities')
    THEN '✅ CRIADA'
    ELSE '❌ NÃO ENCONTRADA'
  END AS status;
```

**Resultado esperado:**
- ✅ Tabela `sport_modalities` criada
- ✅ 9 colunas criadas
- ✅ Função `get_group_modalities` criada
- ✅ 3 índices criados
- ✅ Trigger criado

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após aplicar, marque:

- [ ] Migration aplicada sem erros
- [ ] Tabela `sport_modalities` existe
- [ ] Função `get_group_modalities` existe
- [ ] Índices criados (3)
- [ ] Trigger criado

---

## 🐛 SE HOUVER ERRO

### Erro: "relation already exists"
- **Causa:** Migration já foi aplicada
- **Solução:** Pular para próxima migration

### Erro: "function does not exist: update_updated_at_column"
- **Causa:** Função base não existe
- **Solução:** A migration usa `IF NOT EXISTS`, então deve criar automaticamente

### Erro: "column group_id does not exist in groups"
- **Causa:** Schema diferente do esperado
- **Solução:** Me avise e verifico o schema real

---

## 📝 PRÓXIMO PASSO

Após validar a Migration 1, continue com:
- **Migration 2:** `20260227000002_athlete_modalities.sql`

---

**Status:** ⏳ Aguardando aplicação  
**Última atualização:** 2026-02-27






