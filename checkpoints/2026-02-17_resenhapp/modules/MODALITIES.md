# Módulo: MODALITIES

## Visão Geral

O módulo MODALITIES gerencia as modalidades esportivas disponíveis em cada grupo na plataforma ResenhApp. Cada grupo pode ter suas próprias modalidades personalizadas (ex: futsal, basquete, vôlei), com posições configuráveis por esporte. O módulo usa soft delete via flag `is_active` e garante unicidade pelo par `(group_id, name)`.

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/(dashboard)/modalidades` | Lista de modalidades do grupo ativo |
| `/(dashboard)/modalidades/[id]` | Detalhes e configuração de uma modalidade específica |

---

## API Endpoints

### Modalidades do grupo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/modalities` | Lista todas as modalidades ativas do grupo ativo |
| `POST` | `/api/modalities` | Cria uma nova modalidade no grupo |
| `GET` | `/api/modalities/[modalityId]` | Obtém detalhes de uma modalidade |
| `PATCH` | `/api/modalities/[modalityId]` | Atualiza nome, ícone, cor ou posições da modalidade |
| `DELETE` | `/api/modalities/[modalityId]` | Soft delete da modalidade (is_active = false) |

### Modalidades de atletas (cross-module)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/athletes/[userId]/modalities` | Lista as modalidades de um atleta (ver módulo ATHLETES) |
| `POST` | `/api/athletes/[userId]/modalities` | Adiciona modalidade ao atleta |
| `PATCH` | `/api/athletes/[userId]/modalities/[modalityId]` | Atualiza dados da modalidade do atleta |
| `DELETE` | `/api/athletes/[userId]/modalities/[modalityId]` | Remove modalidade do atleta |

**Request body do POST /api/modalities:**
```json
{
  "name": "Futsal",
  "icon": "futsal",
  "color": "#00FF87",
  "defaultPositions": ["Goleiro", "Fixo", "Ala", "Pivô"]
}
```

**Request body do PATCH /api/modalities/[id]:**
```json
{
  "name": "Futebol Society",
  "color": "#FF6B35",
  "defaultPositions": ["Goleiro", "Zagueiro", "Lateral", "Meia", "Atacante"]
}
```

**Respostas:**
- `200 OK` — Operação bem-sucedida
- `201 Created` — Modalidade criada
- `400 Bad Request` — Dados inválidos
- `403 Forbidden` — Usuário sem permissão de admin
- `404 Not Found` — Modalidade não encontrada
- `409 Conflict` — Já existe modalidade com esse nome no grupo

---

## Componentes

### `modality-card`

**Tipo:** Client Component

**Descrição:** Card visual que representa uma modalidade esportiva na listagem.

**Props principais:**
- `modality: Modality`
- `athleteCount: number` — número de atletas com essa modalidade
- `onEdit: (modalityId: string) => void`
- `onDelete: (modalityId: string) => void`
- `isAdmin: boolean`

**Exibição:**
- Ícone da modalidade
- Nome
- Cor de destaque
- Contador de atletas
- Botões de edição/exclusão (apenas admin)

---

### `modality-form`

**Tipo:** Client Component

**Descrição:** Formulário de criação e edição de modalidade.

**Props principais:**
- `mode: 'create' | 'edit'`
- `modality?: Modality` — dados atuais (modo edit)
- `groupId: string`
- `onSuccess: (modality: Modality) => void`
- `onCancel: () => void`

**Campos:**
- Nome da modalidade (text input)
- Ícone (seletor de ícone do conjunto pré-definido)
- Cor principal (color picker)
- Posições padrão (tags input — permite adicionar e remover posições)

---

### `modality-icon`

**Tipo:** Server Component (sem estado)

**Descrição:** Componente de ícone para modalidades esportivas. Mapeia um identificador de ícone para o SVG correspondente.

**Props principais:**
- `icon: string` — identificador da modalidade (ex: `futsal`, `basketball`)
- `size?: number`
- `color?: string`

**Ícones disponíveis:**

| Identificador | Modalidade |
|--------------|------------|
| `futsal` | Futsal |
| `futebol` | Futebol |
| `basketball` | Basquete |
| `volleyball` | Vôlei |
| `handball` | Handebol |
| `tennis` | Tênis |
| `swimming` | Natação |
| `running` | Corrida |
| `cycling` | Ciclismo |
| `custom` | Personalizado (ícone genérico) |

---

### `modality-modal`

**Tipo:** Client Component

**Descrição:** Modal wrapper que contém o `modality-form` para criação/edição inline na listagem.

**Props principais:**
- `mode: 'create' | 'edit'`
- `modality?: Modality`
- `groupId: string`
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

---

### `positions-config`

**Tipo:** Client Component

**Descrição:** Componente de configuração das posições padrão de uma modalidade. Permite adicionar, remover e reordenar posições via drag-and-drop.

**Props principais:**
- `positions: string[]`
- `onChange: (positions: string[]) => void`
- `suggestions: string[]` — sugestões baseadas no esporte selecionado

**Funcionalidades:**
- Tags com botão de remover
- Input para adicionar nova posição
- Sugestões de posições padrão pelo esporte
- Drag-and-drop para reordenar

---

## Tabelas do Banco de Dados

### `sport_modalities`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo ao qual pertence a modalidade |
| `name` | VARCHAR | Nome da modalidade |
| `icon` | VARCHAR | Identificador do ícone |
| `color` | VARCHAR | Cor em formato hex (ex: `#00FF87`) |
| `default_positions` | JSONB | Array de posições padrão |
| `is_active` | BOOLEAN | Soft delete (default: true) |
| `created_by` | UUID FK | Admin que criou |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

**Constraint:**
```sql
UNIQUE(group_id, name)
```

Garante que não existam duas modalidades com o mesmo nome no mesmo grupo. A constraint opera sobre `is_active` também, ou seja, se uma modalidade for deletada (soft delete), não é possível criar outra com o mesmo nome sem reativar a original.

---

## Posições Padrão por Esporte

Ao criar uma nova modalidade, se o nome corresponder a um esporte conhecido, o sistema pré-preenche as posições padrão automaticamente via `src/lib/modalities.ts`.

| Esporte | Posições Padrão |
|---------|----------------|
| Futsal | Goleiro, Fixo, Ala Direita, Ala Esquerda, Pivô |
| Futebol | Goleiro, Zagueiro, Lateral Direito, Lateral Esquerdo, Volante, Meia, Atacante |
| Basquete | Armador (PG), Ala-Armador (SG), Ala (SF), Ala-Pivô (PF), Pivô (C) |
| Vôlei | Levantador, Ponteiro, Central, Oposto, Líbero |
| Handebol | Goleiro, Ponta Direita, Ponta Esquerda, Ala Direita, Ala Esquerda, Pivô, Central |
| Tênis | (sem posições padrão — modalidade individual) |

---

## Soft Delete

A exclusão de uma modalidade é realizada via soft delete: `is_active = false`. Os dados de `athlete_modalities` vinculados à modalidade excluída são preservados para histórico.

**Comportamento pós soft delete:**
- A modalidade não aparece nas listagens de modalidades disponíveis
- Atletas que já tinham a modalidade mantêm o registro em `athlete_modalities`
- A modalidade não pode ser selecionada em novos cadastros de atletas
- O algoritmo de sorteio ignora modalidades com `is_active = false`

---

## Constraint UNIQUE(group_id, name)

Esta constraint garante que cada grupo tenha nomes de modalidades únicos.

**Comportamento:**
- Tentativa de criar `"Futsal"` quando já existe `"Futsal"` no grupo → `409 Conflict`
- Tentativa de criar `"futsal"` (lowercase) quando existe `"Futsal"` → comportamento depende do collation do banco (case-insensitive recomendado)
- Após soft delete de `"Futsal"`, criar nova `"Futsal"` → `409 Conflict` (a constraint não ignora registros com `is_active = false`)

---

## Biblioteca `src/lib/modalities.ts`

Funções utilitárias para o módulo de modalidades.

**Funções exportadas:**

| Função | Descrição |
|--------|-----------|
| `getDefaultPositionsBySport(name)` | Retorna posições padrão baseado no nome do esporte |
| `getModalityIcon(name)` | Detecta o ícone mais adequado pelo nome |
| `validateModalityName(name, groupId)` | Verifica unicidade do nome no grupo |
| `formatModalityForDisplay(modality)` | Formata dados da modalidade para exibição |
| `getActiveModalities(groupId)` | Busca todas as modalidades ativas do grupo |
| `softDeleteModality(modalityId, groupId)` | Executa o soft delete com validação |

---

## Dependência do GroupContext

O módulo MODALITIES é um **Client Component** que usa o `GroupContext` para:

1. Obter o `groupId` ativo e filtrar modalidades do grupo corrente
2. Verificar se o usuário é admin antes de exibir ações de edição/exclusão
3. Recarregar a lista após operações CRUD

```typescript
const { activeGroupId, isAdmin } = useGroupContext()
```

---

## Integração com Outros Módulos

| Módulo | Integração |
|--------|-----------|
| ATHLETES | `athlete_modalities` referencia `sport_modalities.id` para ratings e posições |
| EVENTS | `draw-config` usa modalidade para filtrar posições no sorteio de times |
| RANKINGS | Stats são calculados por modalidade quando aplicável |

---

## Notas de Implementação

- O ID da tabela `sport_modalities` é UUID (não integer) para evitar colisões entre grupos
- A coluna `default_positions` é JSONB, permitindo arrays de strings de tamanho variável
- A exibição de modalidades na página `/modalidades` é sempre filtrada por `group_id = activeGroupId AND is_active = true`
- Admin pode reativar uma modalidade soft-deletada diretamente via PATCH com `{ is_active: true }`
- A criação de modalidades é restrita a admins do grupo; jogadores só visualizam
