# 🎯 Sprint 1: GroupContext + Multi-Grupo

> **Duração:** 3 dias  
> **Camada:** 1 - Fundação Sólida  
> **Prioridade:** 🔴 Crítica (Bloqueia MVP)

---

## 📋 Objetivo

Implementar sistema completo de seleção e alternância de grupos, permitindo que usuários pertencentes a múltiplos grupos (ex: Atlética com vários esportes) possam alternar facilmente entre eles.

---

## 🎯 Entregas

### 1. GroupContext (`src/contexts/group-context.tsx`)

**Funcionalidades:**
- [ ] Provider global para grupo atual
- [ ] Hook `useGroup()` para acesso fácil
- [ ] Persistência em `localStorage` (chave: `lastSelectedGroup`)
- [ ] Carregamento automático de grupos do usuário
- [ ] Fallback para primeiro grupo se nenhum selecionado
- [ ] Loading state durante carregamento
- [ ] Error handling com toast

**Código Base:**
```typescript
interface GroupContextType {
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  isLoading: boolean;
  userGroups: Group[];
  fetchUserGroups: () => Promise<void>;
}
```

---

### 2. GroupSwitcher Component (`src/components/layout/group-switcher.tsx`)

**Funcionalidades:**
- [ ] Dropdown no header (Topbar)
- [ ] Lista de grupos do usuário
- [ ] Indicador visual do grupo atual (checkmark)
- [ ] Badge com contagem de grupos
- [ ] Link "Criar Novo Grupo"
- [ ] Design System UzzAI aplicado

**UI:**
```
┌─────────────────────┐
│ Futebol          ✓  │ ← Grupo atual
│ Vôlei               │
│ Basquete            │
│─────────────────────│
│ + Criar Grupo       │
└─────────────────────┘
```

---

### 3. Integração em Todas as Páginas

**Páginas a Atualizar:**
- [ ] `/dashboard` - Usar `useGroup()` ao invés de buscar manualmente
- [ ] `/treinos` - Filtrar por `currentGroup.id`
- [ ] `/jogos` - Filtrar por `currentGroup.id`
- [ ] `/financeiro` - Filtrar por `currentGroup.id`
- [ ] `/frequencia` - Filtrar por `currentGroup.id`
- [ ] `/rankings` - Filtrar por `currentGroup.id`
- [ ] `/modalidades` - Filtrar por `currentGroup.id`
- [ ] `/atletas` - Filtrar por `currentGroup.id`

**Padrão de Integração:**
```typescript
// ANTES
const groups = await sql`SELECT * FROM groups WHERE ... LIMIT 1`;
const groupId = groups[0].id;

// DEPOIS
const { currentGroup } = useGroup();
if (!currentGroup) return <EmptyState />;
const groupId = currentGroup.id;
```

---

### 4. API Route: `/api/groups` (Atualizar)

**Funcionalidades:**
- [ ] GET retorna grupos do usuário autenticado
- [ ] Incluir role do usuário em cada grupo
- [ ] Incluir contagem de membros
- [ ] Ordenar por último selecionado (se houver)

**Response:**
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Futebol",
      "description": "...",
      "role": "admin",
      "memberCount": 25,
      "lastSelectedAt": "2026-01-25T10:00:00Z"
    }
  ]
}
```

---

## ✅ Critérios de Done

### Funcionalidade
- [ ] Usuário pode alternar entre grupos via dropdown
- [ ] Grupo selecionado persiste entre sessões (localStorage)
- [ ] Todas as páginas reagem ao grupo atual
- [ ] Fallback funciona se usuário não tem grupos

### UX
- [ ] Loading state durante carregamento inicial
- [ ] Empty state se usuário não tem grupos
- [ ] Toast de confirmação ao alternar grupo
- [ ] Indicador visual claro do grupo atual

### Testes
- [ ] Teste E2E: Alternar entre grupos
- [ ] Teste E2E: Persistência entre sessões
- [ ] Teste: Fallback para primeiro grupo

### Performance
- [ ] Carregamento inicial < 500ms
- [ ] Alternância de grupo < 200ms
- [ ] Sem re-renders desnecessários

---

## 📝 Tarefas Detalhadas

### Dia 1: GroupContext + Provider
- [ ] Criar `src/contexts/group-context.tsx`
- [ ] Implementar `GroupProvider`
- [ ] Implementar `useGroup()` hook
- [ ] Adicionar persistência localStorage
- [ ] Integrar no `src/app/layout.tsx`
- [ ] Testar isoladamente

### Dia 2: GroupSwitcher + Integração
- [ ] Criar `src/components/layout/group-switcher.tsx`
- [ ] Integrar no Topbar
- [ ] Atualizar API `/api/groups`
- [ ] Integrar em 4 páginas principais
- [ ] Testar alternância

### Dia 3: Integração Completa + Testes
- [ ] Integrar nas 4 páginas restantes
- [ ] Remover `groupId` hardcoded
- [ ] Adicionar testes E2E
- [ ] Documentar uso
- [ ] Code review

---

## 🐛 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Performance ao alternar grupo | Médio | Cache de dados + React.memo |
| localStorage não disponível | Baixo | Fallback para sessionStorage |
| Múltiplos grupos muito lentos | Baixo | Paginação + virtualização |

---

## 📚 Referências

- [React Context API](https://react.dev/reference/react/createContext)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- Design System: `src/lib/design-system.ts`

---

**Status:** ⏳ Pendente  
**Início:** ___/___/____  
**Conclusão:** ___/___/____

