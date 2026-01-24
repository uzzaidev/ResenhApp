# 📊 Resumo Executivo - Arquitetura ResenhApp V2.0

> **Visão consolidada da arquitetura completa do sistema**  
> **Data:** 2026-02-27

---

## 🎯 VISÃO GERAL

O **ResenhApp V2.0** é um sistema de gestão esportiva que atende **dois nichos distintos** com **hierarquia de usuários** e **sistema de créditos** para monetização.

---

## 🏗️ ARQUITETURA EM 3 CAMADAS

### 1. HIERARQUIA DE USUÁRIOS

```
ATLÉTICA (Nível Superior)
  ├── GRUPO 1 (Responsável)
  │   ├── Usuário 1
  │   ├── Usuário 2
  │   └── Usuário 3
  │
  └── GRUPO 2 (Responsável)
      ├── Usuário 4
      └── Usuário 5
```

**Permissões:**
- **Atlética:** Controla tudo (criar grupos, gerenciar créditos, ver analytics)
- **Responsável:** Controla seu grupo (gerenciar membros, criar eventos, usar features com créditos)
- **Usuário:** Acesso limitado (confirmar presença, ver rankings, pagar)

---

### 2. DOIS NICHOS

#### Nicho 1: Atléticas (Sistema Completo)
- **Tipo:** `group_type = 'athletic'`
- **Features:**
  - ✅ Múltiplas modalidades
  - ✅ Gestão de atletas
  - ✅ Treinos recorrentes
  - ✅ Jogos oficiais
  - ✅ Convocações
  - ✅ QR Code check-in
  - ✅ Rankings por modalidade
  - ✅ Tabelinha tática

#### Nicho 2: Peladas (Sistema Simples)
- **Tipo:** `group_type = 'pelada'`
- **Features:**
  - ✅ Confirmações (RSVP)
  - ✅ Sorteio de times
  - ✅ Rankings básicos
  - ✅ Pagamentos simples
  - ✅ Check-in básico
  - ❌ Múltiplas modalidades (não aplicável)
  - ❌ Treinos recorrentes (não aplicável)

---

### 3. SISTEMA DE CRÉDITOS

**Conceito:** Créditos = Poder usar o aplicativo

**Fluxo:**
1. Atlética/Responsável compra créditos
2. Créditos adicionados ao saldo
3. Ao usar feature premium, créditos são consumidos
4. Se sem créditos: Feature bloqueada + opção de comprar

**Custos:**
- Treino Recorrente: 5 créditos
- QR Code Check-in: 2 créditos
- Convocação: 3 créditos
- Analytics: 10 créditos/mês
- Split Pix: 15 créditos/evento

**Pacotes:**
- Básico: R$ 20 = 100 créditos
- Intermediário: R$ 50 = 300 créditos
- Premium: R$ 100 = 700 créditos
- Mensal: R$ 30/mês = 200 créditos/mês

---

## 💰 SISTEMA FINANCEIRO

### Pagamentos Hierárquicos

**Prioridade:**
1. Se Atlética tem Pix → Usuários pagam para Atlética
2. Se Grupo tem Pix → Usuários pagam para Grupo
3. Se nenhum → Pagamento manual

**Decisão sempre vem de cima** (Atlética define ou delega para Grupo)

---

## 📊 TABELAS PRINCIPAIS

### Hierarquia e Créditos
- `groups` - Adicionar: `parent_group_id`, `group_type`, `pix_code`, `credits_balance`
- `credit_transactions` - Transações de créditos
- `credit_packages` - Pacotes de créditos disponíveis

### Modalidades (Atléticas)
- `sport_modalities` - Modalidades esportivas
- `athlete_modalities` - Atletas por modalidade

### Features Premium
- `game_convocations` - Convocações para jogos
- `checkin_qrcodes` - QR Codes de check-in
- `saved_tactics` - Táticas salvas

### Financeiro
- `charges` - Adicionar: `event_id` (pagamentos por treino)

---

## 🔐 PERMISSÕES

### Matriz Simplificada

| Ação | Atlética | Responsável | Usuário |
|------|----------|-------------|---------|
| Criar Grupos | ✅ | ❌ | ❌ |
| Gerenciar Membros | ✅ (todos) | ✅ (seu) | ❌ |
| Criar Eventos | ✅ (todos) | ✅ (seu) | ❌ |
| Features Premium | ✅ (com créditos) | ✅ (com créditos) | ❌ |
| Confirmar Presença | ✅ | ✅ | ✅ |
| Ver Analytics | ✅ (todos) | ✅ (seu) | ✅ (limitado) |

---

## 🚀 ROADMAP RESUMIDO

### Fase 0: Fundação (Semana 1-2)
- Migrations de hierarquia e créditos
- Sistema de créditos funcional
- Permissões hierárquicas

### Fase 1-8: Features (Semana 3-18)
- Modalidades e Atletas
- Treinos Avançados
- Financeiro
- Jogos Oficiais
- Frequência
- Rankings
- Tabelinha Tática
- Dashboard

**Total: 18 semanas (4.5 meses)**

---

## 📚 DOCUMENTAÇÃO COMPLETA

1. **[PLANO-EXECUCAO-COMPLETO.md](./PLANO-EXECUCAO-COMPLETO.md)** - Plano detalhado
2. **[ARQUITETURA-HIERARQUIA-CREDITOS.md](./ARQUITETURA-HIERARQUIA-CREDITOS.md)** - Hierarquia e créditos
3. **[MAPEO-FEATURES-DETALHADO.md](./MAPEO-FEATURES-DETALHADO.md)** - Mapeamento de features
4. **[MIGRATIONS-NECESSARIAS.md](./MIGRATIONS-NECESSARIAS.md)** - SQL migrations

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Arquitetura Completa Mapeada

