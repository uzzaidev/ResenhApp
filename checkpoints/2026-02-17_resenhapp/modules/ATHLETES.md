# Módulo: ATHLETES

## Visão Geral

O módulo ATHLETES gerencia o cadastro e a visualização dos atletas de um grupo, suas modalidades esportivas, posições e avaliações. É um componente Client-side com dependência direta do `GroupContext` para carregar os dados do grupo ativo. Suporta filtros múltiplos, estatísticas agregadas e edição de ratings individuais por modalidade.

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/(dashboard)/atletas` | Tabela de atletas do grupo ativo com filtros |
| `/(dashboard)/atletas/[id]` | Perfil detalhado de um atleta específico |

---

## API Endpoints

### Modalidades de Atleta

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/athletes/[userId]/modalities` | Lista as modalidades de um atleta específico |
| `POST` | `/api/athletes/[userId]/modalities` | Adiciona uma modalidade ao atleta |
| `PATCH` | `/api/athletes/[userId]/modalities/[modalityId]` | Atualiza rating e/ou posições de uma modalidade do atleta |
| `DELETE` | `/api/athletes/[userId]/modalities/[modalityId]` | Remove uma modalidade do atleta |

**Request body do POST:**
```json
{
  "modalityId": "uuid",
  "rating": 7,
  "positions": ["goleiro", "zagueiro"]
}
```

**Request body do PATCH:**
```json
{
  "rating": 8,
  "positions": ["atacante"]
}
```

**Respostas:**
- `200 OK` — Operação bem-sucedida
- `201 Created` — Modalidade adicionada
- `400 Bad Request` — Dados inválidos (rating fora do range 1-10)
- `403 Forbidden` — Usuário sem permissão de admin
- `404 Not Found` — Atleta ou modalidade não encontrada
- `409 Conflict` — Atleta já possui essa modalidade

---

## Componentes

### `athletes-table`

**Tipo:** Client Component

**Descrição:** Tabela principal que exibe todos os atletas do grupo com suas modalidades, posições e ratings. Suporta filtros e ações administrativas.

**Props principais:**
- `athletes: Athlete[]` — array de atletas com modalidades embutidas
- `onRatingEdit: (athleteId: string, modalityId: string) => void` — abre modal de edição de rating
- `onModalityAdd: (athleteId: string) => void` — abre modal de adição de modalidade
- `onModalityRemove: (athleteId: string, modalityId: string) => void` — remove modalidade

**Colunas:**
- Avatar + Nome
- E-mail
- Modalidades (badges)
- Posições
- Rating médio
- Ações (editar rating, adicionar modalidade)

---

### `add-modality-modal`

**Tipo:** Client Component

**Descrição:** Modal para adicionar uma nova modalidade a um atleta com rating inicial e posições.

**Props principais:**
- `athleteId: string`
- `availableModalities: Modality[]` — modalidades disponíveis no grupo que o atleta ainda não possui
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

**Campos:**
- Seleção de modalidade (dropdown)
- Rating inicial (slider 1-10)
- Posições (checkboxes baseadas na modalidade selecionada)

---

### `athlete-filters`

**Tipo:** Client Component

**Descrição:** Barra de filtros para a tabela de atletas.

**Props principais:**
- `modalities: Modality[]` — modalidades disponíveis no grupo
- `onFilterChange: (filters: AthleteFilters) => void`

**Filtros disponíveis:**

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| Busca por nome | Text input | Filtra pelo nome do atleta |
| Modalidade | Select | Exibe apenas atletas com a modalidade selecionada |
| Rating mínimo | Slider | Exibe apenas atletas com rating >= valor |
| Posição | Select | Exibe apenas atletas com a posição na modalidade |

---

### `edit-rating-modal`

**Tipo:** Client Component

**Descrição:** Modal para editar o rating de um atleta em uma modalidade específica.

**Props principais:**
- `athleteId: string`
- `modalityId: string`
- `currentRating: number`
- `currentPositions: string[]`
- `availablePositions: string[]` — posições disponíveis para a modalidade
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

**Campos:**
- Slider de rating (1-10)
- Checkboxes de posições

---

### `modality-badge`

**Tipo:** Client Component (ou Server Component sem estado)

**Descrição:** Badge visual para exibir o nome de uma modalidade com cor representativa.

**Props principais:**
- `name: string` — nome da modalidade
- `color?: string` — cor customizada (hex)
- `showRating?: boolean` — exibe o rating ao lado do nome
- `rating?: number`

---

## Tabelas do Banco de Dados

### `group_members` (tabela base dos atletas)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo do atleta |
| `user_id` | UUID FK | Referência ao usuário |
| `role` | VARCHAR | `admin` ou `player` |
| `status` | VARCHAR | `active`, `inactive`, `banned` |
| `joined_at` | TIMESTAMP | Data de entrada no grupo |

O módulo ATHLETES usa `group_members` como base de dados de atletas, fazendo JOIN com `users` para obter nome/e-mail e com `athlete_modalities` para obter ratings e posições.

### `athlete_modalities`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID FK | Referência ao usuário |
| `group_id` | UUID FK | Grupo ao qual pertence a configuração |
| `modality_id` | UUID FK | Modalidade esportiva |
| `rating` | INTEGER | Avaliação de 1 a 10 |
| `positions` | JSONB | Array de posições (ex: `["atacante", "meia"]`) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

**Constraints:**
- `UNIQUE(user_id, group_id, modality_id)` — um atleta tem apenas um registro por modalidade por grupo

---

## Dependência do GroupContext

O módulo ATHLETES é um **Client Component** que depende do `GroupContext` para:

1. Obter o `groupId` ativo do usuário
2. Filtrar atletas apenas do grupo corrente
3. Atualizar a lista após operações CRUD
4. Verificar se o usuário atual tem permissão de admin no grupo

```typescript
const { activeGroupId, isAdmin } = useGroupContext()
```

Quando o usuário troca de grupo (via `POST /api/groups/switch`), o `GroupContext` atualiza e a lista de atletas é recarregada automaticamente.

---

## Estatísticas Exibidas

O cabeçalho da página exibe métricas calculadas client-side a partir dos dados carregados:

| Métrica | Cálculo |
|---------|---------|
| Total de atletas | `athletes.length` |
| Total de modalidades distintas | `new Set(athletes.flatMap(a => a.modalities.map(m => m.modalityId))).size` |
| Atletas multi-modalidade | `athletes.filter(a => a.modalities.length > 1).length` |
| Rating médio geral | Média de todos os ratings de todos os atletas |

---

## Sistema de Rating

| Valor | Classificação |
|-------|---------------|
| 1-3 | Iniciante |
| 4-5 | Intermediário baixo |
| 6-7 | Intermediário |
| 8-9 | Avançado |
| 10 | Elite |

- Rating é por modalidade (um atleta pode ter rating 9 no futsal e 5 no basquete)
- Rating é definido pelo admin do grupo
- Rating é usado no algoritmo de sorteio de times quando `considerRatings = true`

---

## Posições por Modalidade

As posições disponíveis para seleção dependem da modalidade. São armazenadas como JSONB array em `athlete_modalities.positions`.

**Exemplos:**

| Modalidade | Posições disponíveis |
|------------|---------------------|
| Futsal / Futebol | Goleiro, Defensor, Ala, Meia, Atacante |
| Basquete | Armador, Ala-armador, Ala, Ala-pivô, Pivô |
| Vôlei | Levantador, Ponteiro, Central, Oposto, Líbero |
| Handebol | Goleiro, Ponta, Ala, Pivô, Central |
| Tênis | N/A (modalidade individual) |

As posições disponíveis são configuradas na tabela `sport_modalities.default_positions` (ver módulo MODALITIES).

---

## Filtro e Performance

- A lista de atletas é carregada uma única vez via `GET /api/groups/[groupId]/members?include=modalities`
- Os filtros de busca, modalidade, rating e posição são aplicados **client-side** sobre o array já carregado
- Para grupos com muitos atletas (100+), considerar paginação server-side futura

---

## Notas de Implementação

- A página `/(dashboard)/atletas` é um Client Component renderizado dentro do layout do dashboard
- Admin pode editar ratings e modalidades de qualquer atleta do grupo
- Players só podem visualizar seus próprios dados na página de perfil (`/atletas/[id]`)
- A remoção de um atleta do grupo (feita no módulo GROUPS → members-manager) não remove seus dados de `athlete_modalities`; os dados são preservados para histórico
- Rating mínimo exigido: 1; máximo: 10 (validado com Zod no backend)
