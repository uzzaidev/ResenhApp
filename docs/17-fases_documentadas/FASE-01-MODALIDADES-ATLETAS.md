# 📋 FASE 1: Core - Modalidades e Atletas

> **Duração:** Semana 3-4 (2 semanas)  
> **Status:** ⏸️ Planejado  
> **Prioridade:** 🔴 Alta  
> **Depende de:** Fase 0 (Migrations aplicadas)

---

## 🎯 OBJETIVO DA FASE

Implementar gestão completa de múltiplas modalidades esportivas e atletas com suporte a múltiplas modalidades por atleta.

---

## 📊 CONTEXTO

### Dependências
- ✅ Fase 0 concluída (migrations aplicadas)
- ✅ Tabelas `sport_modalities` e `athlete_modalities` criadas
- ✅ Design System base criado

### O que esta fase habilita
- ✅ Gestão de modalidades por grupo
- ✅ Atletas podem participar de múltiplas modalidades
- ✅ Base para treinos, rankings e outras features

---

## 📝 TAREFAS DETALHADAS

### Tarefa 2.1: Backend - Modalidades

#### APIs a Criar

**Arquivo:** `src/app/api/modalities/route.ts`
```typescript
// GET /api/modalities?group_id=xxx
// POST /api/modalities
```

**Arquivo:** `src/app/api/modalities/[id]/route.ts`
```typescript
// GET /api/modalities/[id]
// PATCH /api/modalities/[id]
// DELETE /api/modalities/[id]
```

**Arquivo:** `src/app/api/modalities/[id]/positions/route.ts`
```typescript
// GET /api/modalities/[id]/positions
// POST /api/modalities/[id]/positions
// DELETE /api/modalities/[id]/positions/[positionId]
```

**Checklist:**
- [ ] Criar route handlers
- [ ] Implementar validação (Zod)
- [ ] Implementar permissões (apenas admin do grupo)
- [ ] Testar todas as operações CRUD
- [ ] Documentar APIs

---

### Tarefa 2.2: Backend - Atletas por Modalidade

#### APIs a Criar

**Arquivo:** `src/app/api/athletes/[userId]/modalities/route.ts`
```typescript
// GET /api/athletes/[userId]/modalities
// POST /api/athletes/[userId]/modalities
```

**Arquivo:** `src/app/api/athletes/[userId]/modalities/[modalityId]/route.ts`
```typescript
// PATCH /api/athletes/[userId]/modalities/[modalityId]
// DELETE /api/athletes/[userId]/modalities/[modalityId]
```

**Checklist:**
- [ ] Criar route handlers
- [ ] Validar relacionamento Many-to-Many
- [ ] Implementar atualização de posições/rating
- [ ] Testar adicionar/remover modalidades

---

### Tarefa 2.3: Frontend - Página Modalidades

#### Arquivos a Criar

```
src/app/(dashboard)/modalidades/
  ├── page.tsx                   # Lista de modalidades
  ├── [id]/page.tsx             # Detalhes da modalidade
  └── components/
      ├── ModalityCard.tsx      # Card com estatísticas
      ├── ModalityForm.tsx       # Form criar/editar
      └── PositionsConfig.tsx   # Configurar posições
```

#### Componentes

**ModalityCard:**
- Ícone da modalidade
- Nome
- Estatísticas: Atletas, Treinos/Semana, Frequência
- Botão de ação (editar)

**ModalityForm:**
- Campos: Nome, Ícone, Cor, Treinos/Semana
- Validação
- Submit para criar/editar

**PositionsConfig:**
- Lista de posições
- Adicionar/remover posições
- Salvar configuração

**Checklist:**
- [ ] Criar página principal
- [ ] Criar página de detalhes
- [ ] Criar componentes
- [ ] Integrar com API
- [ ] Testar UI

---

### Tarefa 2.4: Frontend - Página Atletas (Melhorada)

#### Arquivos a Modificar/Criar

```
src/app/(dashboard)/atletas/
  ├── page.tsx                   # Lista de atletas (melhorar)
  └── components/
      ├── AthletesTable.tsx     # Tabela com filtros
      ├── AthleteRow.tsx         # Linha da tabela
      ├── AthleteFilters.tsx     # Componente de filtros
      └── AthleteForm.tsx        # Form editar atleta
```

#### Funcionalidades

**Filtros:**
- Busca (nome/email)
- Filtro por modalidade
- Filtro por status (Ouro, Ativo, Treinador)
- Ordenação (Nome, Frequência, Mais Recentes)

**Tabela:**
- Avatar + Nome + Email
- Badges de modalidades
- Status badge
- Frequência com cor
- Botão editar

**Modal Editar:**
- Adicionar/remover modalidades
- Editar posições preferidas
- Editar rating

**Checklist:**
- [ ] Melhorar página existente
- [ ] Criar componentes de filtro
- [ ] Criar modal de edição
- [ ] Integrar com API de modalidades
- [ ] Testar filtros e ordenação

---

## ✅ CHECKLIST COMPLETO

### Backend
- [ ] API GET /api/modalities
- [ ] API POST /api/modalities
- [ ] API PATCH /api/modalities/[id]
- [ ] API DELETE /api/modalities/[id]
- [ ] API GET /api/modalities/[id]/positions
- [ ] API POST /api/modalities/[id]/positions
- [ ] API DELETE /api/modalities/[id]/positions/[positionId]
- [ ] API GET /api/athletes/[userId]/modalities
- [ ] API POST /api/athletes/[userId]/modalities
- [ ] API PATCH /api/athletes/[userId]/modalities/[modalityId]
- [ ] API DELETE /api/athletes/[userId]/modalities/[modalityId]

### Frontend
- [ ] Página Modalidades criada
- [ ] Página Detalhes Modalidade criada
- [ ] Componente ModalityCard
- [ ] Componente ModalityForm
- [ ] Componente PositionsConfig
- [ ] Página Atletas melhorada
- [ ] Componente AthletesTable
- [ ] Componente AthleteFilters
- [ ] Modal editar atleta
- [ ] Integração completa com APIs

### Testes
- [ ] Testes unitários (backend)
- [ ] Testes de integração (API)
- [ ] Testes E2E (frontend crítico)

---

## 📦 ENTREGÁVEIS

1. ✅ CRUD completo de modalidades
2. ✅ Atletas com múltiplas modalidades
3. ✅ UI conforme design HTML
4. ✅ Filtros e busca funcionando

---

## 🚀 PRÓXIMOS PASSOS (Após Fase 1)

1. **Iniciar Fase 2:** Treinos Avançados
2. **Validar:** Modalidades em produção
3. **Coletar feedback:** Usuários sobre UI

---

**Última atualização:** 2026-02-27  
**Status:** ⏸️ Planejado






