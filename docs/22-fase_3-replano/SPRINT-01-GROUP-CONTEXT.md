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
- [x] Provider global para grupo atual ✅
- [x] Hook `useGroup()` para acesso fácil ✅
- [x] Persistência em `localStorage` (chave: `currentGroupId`) ✅
- [x] Carregamento automático de grupos do usuário ✅
- [x] Fallback para primeiro grupo se nenhum selecionado ✅
- [x] Loading state durante carregamento ✅
- [x] Error handling com toast ✅

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
- [x] Dropdown no header (Topbar) ✅
- [x] Lista de grupos do usuário ✅
- [x] Indicador visual do grupo atual (checkmark) ✅
- [x] Badge com contagem de grupos ✅
- [x] Link "Criar Novo Grupo" ✅
- [x] Design System UzzAI aplicado ✅

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
- [x] `/dashboard` - Usar componentes Client que já usam `useGroup()` ✅
- [x] `/treinos` - Usar `getUserCurrentGroup()` helper ✅
- [x] `/jogos` - Usar `getUserCurrentGroup()` helper ✅
- [x] `/financeiro` - Usar `getUserCurrentGroup()` helper ✅
- [x] `/frequencia` - Usar `getUserCurrentGroup()` helper ✅
- [x] `/rankings` - Usar `getUserCurrentGroup()` helper ✅
- [x] `/modalidades` - Usar `useGroup()` hook ✅
- [x] `/atletas` - Usar `useGroup()` hook ✅

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
- [x] GET retorna grupos do usuário autenticado ✅
- [x] Incluir role do usuário em cada grupo ✅
- [x] Incluir contagem de membros ✅
- [x] Ordenar por último selecionado (se houver) ✅

### 5. API Route: `/api/groups/switch` (Nova)

**Funcionalidades:**
- [x] POST para alternar grupo atual (atualiza cookie) ✅
- [x] Validação de membership ✅
- [x] Sincronização com localStorage ✅

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

### Dia 1: GroupContext + Provider ✅ COMPLETO
- [x] Criar `src/contexts/group-context.tsx` ✅
- [x] Implementar `GroupProvider` ✅
- [x] Implementar `useGroup()` hook ✅
- [x] Adicionar persistência localStorage ✅
- [x] Integrar no `src/app/layout.tsx` ✅
- [x] Testar isoladamente ✅

### Dia 2: GroupSwitcher + Integração ✅ COMPLETO
- [x] Criar `src/components/layout/group-switcher.tsx` ✅
- [x] Integrar no Topbar ✅
- [x] Atualizar API `/api/groups` ✅
- [x] Criar API `/api/groups/switch` ✅
- [x] Integrar em 4 páginas principais ✅
- [x] Testar alternância ✅

### Dia 3: Integração Completa + Testes ✅ COMPLETO
- [x] Integrar nas 4 páginas restantes ✅
- [x] Remover `groupId` hardcoded ✅
- [x] Criar helper `getUserCurrentGroup()` para Server Components ✅
- [x] Documentar uso ✅
- [ ] Adicionar testes E2E (pendente)
- [ ] Code review (pendente)

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

**Status:** ✅ **95% COMPLETO** (Falta apenas testes E2E)  
**Início:** 2026-01-25  
**Conclusão:** 2026-01-25 (parcial)

---

## 📝 Notas de Implementação

### Arquivos Criados/Modificados

1. **`src/contexts/group-context.tsx`** - Melhorado com toast e sincronização cookie
2. **`src/components/layout/group-switcher.tsx`** - Novo componente criado
3. **`src/lib/group-helpers.ts`** - Helper para Server Components
4. **`src/app/api/groups/switch/route.ts`** - Nova API para alternar grupo
5. **`src/app/api/groups/route.ts`** - Atualizado com memberCount
6. **`src/components/layout/topbar.tsx`** - Integrado GroupSwitcher
7. **8 páginas atualizadas** para usar GroupContext ou helper

### Decisões Técnicas

- **Server Components:** Usam `getUserCurrentGroup()` helper que lê cookie
- **Client Components:** Usam `useGroup()` hook diretamente
- **Sincronização:** Cookie + localStorage mantidos em sync via API `/api/groups/switch`
- **Fallback:** Se não houver cookie, usa primeiro grupo do usuário

### Próximos Passos

- [ ] Testes E2E de alternância de grupos
- [ ] Teste de persistência entre sessões
- [ ] Code review final

