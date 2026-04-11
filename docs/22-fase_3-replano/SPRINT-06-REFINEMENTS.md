# 🎯 Sprint 6: Skeletons + Empty States + Busca

> **Duração:** 5 dias  
> **Camada:** 3 - Refinamentos  
> **Prioridade:** 🟢 Refinamento (Profissionalismo)

---

## 📋 Objetivo

Polir a experiência visual com skeletons específicos, empty states construtivos e busca global funcional, elevando o nível de profissionalismo do sistema.

---

## 🎯 Entregas

### 1. Skeletons Específicos por Página

**Páginas a Criar Skeletons:**
- [ ] `/dashboard` - DashboardSkeleton
- [ ] `/treinos` - TrainingsSkeleton
- [ ] `/jogos` - GamesSkeleton
- [ ] `/financeiro` - FinancialSkeleton
- [ ] `/frequencia` - FrequencySkeleton
- [ ] `/rankings` - RankingsSkeleton
- [ ] `/modalidades` - ModalitiesSkeleton
- [ ] `/atletas` - AthletesSkeleton

**Padrão:**
```typescript
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Section Skeleton */}
      <div className="h-48 bg-gray-800 rounded-2xl animate-pulse" />
      
      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
```

**Requisitos:**
- [ ] Manter estrutura visual da página
- [ ] Animação de shimmer
- [ ] Responsivo (mobile/tablet/desktop)

---

### 2. Empty States Construtivos

**Padrão:**
```typescript
<EmptyState
  icon={Calendar}
  title="Nenhum treino agendado"
  description="Comece criando seu primeiro treino e convide seus atletas!"
  action={{
    label: "Criar Treino",
    onClick: () => router.push("/treinos/new")
  }}
>
  <div className="mt-6 space-y-2">
    <Link href="/tutorial" className="text-sm text-blue-400 hover:underline">
      📚 Ver Tutorial
    </Link>
    <Link href="/suporte" className="text-sm text-blue-400 hover:underline">
      💬 Preciso de ajuda
    </Link>
  </div>
</EmptyState>
```

**Empty States a Criar:**
- [ ] Sem treinos → "Criar Treino" + Tutorial
- [ ] Sem modalidades → "Criar Modalidade" + Guia
- [ ] Sem atletas → "Adicionar Atleta" + Importar
- [ ] Sem cobranças → "Criar Cobrança" + Help
- [ ] Sem grupos → "Criar Grupo" + Onboarding

**Requisitos:**
- [ ] Ilustração/ícone grande
- [ ] Título claro
- [ ] Descrição acionável
- [ ] CTA principal
- [ ] Links secundários (tutorial, ajuda)

---

### 3. Materialized View de Busca

**Arquivo:** `supabase/migrations/YYYYMMDDHHMMSS_create_search_index.sql`

**View:**
```sql
CREATE MATERIALIZED VIEW search_index AS
SELECT
  'athlete' AS type,
  u.id AS entity_id,
  u.name AS title,
  u.email AS subtitle,
  '/atletas/' || u.id AS url,
  u.image AS icon_url,
  g.id AS group_id,
  to_tsvector('portuguese', u.name || ' ' || COALESCE(u.email, '')) AS search_vector
FROM users u
INNER JOIN group_members gm ON u.id = gm.user_id
INNER JOIN groups g ON gm.group_id = g.id

UNION ALL

SELECT
  'training' AS type,
  e.id,
  'Treino ' || TO_CHAR(e.starts_at, 'DD/MM HH24:MI') AS title,
  v.name AS subtitle,
  '/events/' || e.id AS url,
  NULL AS icon_url,
  e.group_id,
  to_tsvector('portuguese', COALESCE(v.name, '') || ' ' || TO_CHAR(e.starts_at, 'DD/MM')) AS search_vector
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
WHERE e.event_type = 'training'

UNION ALL

SELECT
  'modality' AS type,
  m.id,
  m.name AS title,
  m.description AS subtitle,
  '/modalidades/' || m.id AS url,
  m.icon AS icon_url,
  m.group_id,
  to_tsvector('portuguese', m.name || ' ' || COALESCE(m.description, '')) AS search_vector
FROM sport_modalities m;

-- Índice GIN para busca rápida
CREATE INDEX idx_search_vector ON search_index USING GIN(search_vector);
CREATE INDEX idx_search_group ON search_index(group_id);
```

**Refresh:**
```sql
-- Atualizar view (executar periodicamente ou via trigger)
REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;
```

---

### 4. API de Busca

**Arquivo:** `src/app/api/search/route.ts`

**Endpoint:**
- [ ] `GET /api/search?q=joão&group_id=xxx`

**Funcionalidades:**
- [ ] Busca full-text (PostgreSQL)
- [ ] Filtrar por grupo
- [ ] Limitar resultados (10 por tipo)
- [ ] Categorizar por tipo

**Response:**
```json
{
  "results": {
    "athletes": [
      {
        "id": "uuid",
        "title": "João Silva",
        "subtitle": "joao@email.com",
        "url": "/atletas/uuid",
        "icon_url": "..."
      }
    ],
    "trainings": [...],
    "modalities": [...]
  }
}
```

---

### 5. SearchCommand Conectado

**Arquivo:** `src/components/ui/search-command.tsx` (atualizar)

**Funcionalidades:**
- [ ] Conectar à API real
- [ ] Debounce (300ms)
- [ ] Categorizar resultados
- [ ] Navegação por teclado
- [ ] Histórico de buscas (localStorage)

**UI:**
```
┌─────────────────────────────────────┐
│ 🔍 Buscar...                        │
├─────────────────────────────────────┤
│ 👥 Atletas                          │
│   João Silva                        │
│   joao@email.com                    │
├─────────────────────────────────────┤
│ 📅 Treinos                          │
│   Treino 25/01 19:00                │
│   Quadra Central                    │
├─────────────────────────────────────┤
│ 💪 Modalidades                      │
│   Futebol                           │
└─────────────────────────────────────┘
```

---

## ✅ Critérios de Done

### Funcionalidade
- [ ] Cada página tem skeleton único
- [ ] Empty states têm ilustração + CTA
- [ ] Busca global funciona (Cmd+K)
- [ ] Resultados categorizados

### UX
- [ ] Skeletons mantêm estrutura visual
- [ ] Empty states são construtivos
- [ ] Busca é rápida (< 300ms)
- [ ] Navegação por teclado funciona

### Testes
- [ ] Teste: Busca retorna resultados corretos
- [ ] Teste: Empty states aparecem quando apropriado
- [ ] Teste: Skeletons aparecem durante loading

---

## 📝 Tarefas Detalhadas

### Dia 1: Skeletons
- [ ] Criar 8 skeletons específicos
- [ ] Integrar em todas as páginas
- [ ] Testar responsividade
- [ ] Ajustar animações

### Dia 2: Empty States
- [ ] Criar 5 empty states
- [ ] Adicionar ilustrações/ícones
- [ ] Adicionar CTAs contextuais
- [ ] Integrar nas páginas

### Dia 3: Materialized View + API
- [ ] Criar migration de search_index
- [ ] Criar API `/api/search`
- [ ] Testar busca full-text
- [ ] Otimizar queries

### Dia 4: SearchCommand
- [ ] Conectar SearchCommand à API
- [ ] Implementar debounce
- [ ] Adicionar histórico
- [ ] Testar navegação por teclado

### Dia 5: Testes + Polimento
- [ ] Testes E2E de busca
- [ ] Ajustes finais de UX
- [ ] Documentação
- [ ] Code review

---

## 🐛 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Busca muito lenta | Médio | Índice GIN + limitar resultados |
| Materialized view desatualizada | Baixo | Refresh periódico ou trigger |
| Muitos resultados | Baixo | Paginação ou limit por tipo |

---

## 📚 Referências

- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Materialized Views](https://www.postgresql.org/docs/current/sql-creatematerializedview.html)
- [Shadcn Command](https://ui.shadcn.com/docs/components/command)

---

**Status:** ⏳ Pendente  
**Início:** ___/___/____  
**Conclusão:** ___/___/____






