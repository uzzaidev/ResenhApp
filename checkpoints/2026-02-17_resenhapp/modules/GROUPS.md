# Módulo: GROUPS

## Visão Geral

O módulo GROUPS gerencia a criação, configuração e administração de grupos esportivos na plataforma ResenhApp. Suporta uma hierarquia de dois níveis (Athletic → Pelada), controle de privacidade, sistema de convites, gerenciamento de membros, configurações de eventos e criação de carteiras financeiras automáticas.

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/groups/new` | Criação de um novo grupo |
| `/groups/join` | Entrar em um grupo via código de convite |
| `/groups/[groupId]` | Página principal do grupo (visão geral) |
| `/groups/[groupId]/settings` | Configurações do grupo (abas) |

---

## API Endpoints

### Grupos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups` | Lista todos os grupos do usuário autenticado |
| `POST` | `/api/groups` | Cria um novo grupo |
| `GET` | `/api/groups/[groupId]` | Obtém detalhes de um grupo específico |
| `PATCH` | `/api/groups/[groupId]` | Atualiza informações do grupo |
| `DELETE` | `/api/groups/[groupId]` | Remove o grupo (soft delete) |
| `POST` | `/api/groups/switch` | Troca o grupo ativo da sessão do usuário |
| `POST` | `/api/groups/join` | Entra em um grupo via código de convite |
| `GET` | `/api/groups/managed` | Lista os grupos onde o usuário é administrador |

### Convites

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups/[groupId]/invites` | Lista os convites do grupo |
| `POST` | `/api/groups/[groupId]/invites` | Cria um novo convite |
| `DELETE` | `/api/groups/[groupId]/invites/[inviteId]` | Revoga um convite |
| `POST` | `/api/groups/[groupId]/invites/regenerate` | Gera um novo código de convite padrão |

### Membros

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups/[groupId]/members` | Lista os membros do grupo |
| `PATCH` | `/api/groups/[groupId]/members/[memberId]` | Atualiza o papel/status de um membro |
| `DELETE` | `/api/groups/[groupId]/members/[memberId]` | Remove um membro do grupo |
| `POST` | `/api/groups/[groupId]/members/create-user` | Admin cria novo usuário e já o adiciona ao grupo |

### Configurações de Evento

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups/[groupId]/event-settings` | Obtém as configurações padrão de eventos do grupo |
| `PATCH` | `/api/groups/[groupId]/event-settings` | Atualiza as configurações padrão de eventos |

### Configuração de Sorteio

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups/[groupId]/draw-config` | Obtém a configuração de sorteio do grupo |
| `PATCH` | `/api/groups/[groupId]/draw-config` | Atualiza a configuração de sorteio |

### Perfis de Recebedor

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups/[groupId]/receiver-profiles` | Lista os perfis PIX do grupo |
| `POST` | `/api/groups/[groupId]/receiver-profiles` | Cria um novo perfil de recebedor |
| `PATCH` | `/api/groups/[groupId]/receiver-profiles/[profileId]` | Atualiza um perfil de recebedor |
| `DELETE` | `/api/groups/[groupId]/receiver-profiles/[profileId]` | Remove um perfil de recebedor |

---

## Componentes

### `create-group-form`

**Tipo:** Client Component

**Descrição:** Formulário de criação de novo grupo. Coleta nome, tipo, privacidade e grupo pai (se pelada).

**Props principais:**
- `parentGroups: Group[]` — lista de atléticas disponíveis para vinculação
- `onSuccess: (groupId: string) => void` — callback após criação

**Campos do formulário:**
- Nome do grupo
- Tipo (`athletic` | `pelada`)
- Privacidade (`public` | `private`)
- Grupo pai (visível somente quando tipo = `pelada`)

---

### `group-info-form`

**Tipo:** Client Component

**Descrição:** Formulário de edição das informações básicas de um grupo (nome, descrição, foto, privacidade).

**Props principais:**
- `group: Group` — dados atuais do grupo
- `onSave: (updatedGroup: Partial<Group>) => void`

---

### `group-settings-tabs`

**Tipo:** Client Component

**Descrição:** Container de abas para a página de configurações do grupo. Organiza os sub-formulários em abas navegáveis.

**Abas disponíveis:**
1. Informações Gerais (`group-info-form`)
2. Configurações de Evento (`event-settings-form`)
3. Membros (`members-manager`)
4. Convites (`invites-manager`)
5. Configuração de Sorteio (link para `draw-config-modal`)

---

### `event-settings-form`

**Tipo:** Client Component

**Descrição:** Configura os valores padrão para eventos criados no grupo (horário, local, limite de participantes, cobrança automática).

**Props principais:**
- `groupId: string`
- `eventSettings: EventSettings`
- `venues: Venue[]`

---

### `members-manager`

**Tipo:** Client Component

**Descrição:** Tabela de membros do grupo com ações de promover a admin, rebaixar a membro e remover do grupo.

**Props principais:**
- `groupId: string`
- `members: GroupMember[]`
- `currentUserId: string`

**Funcionalidades:**
- Busca por nome
- Filtro por papel (admin/player)
- Ação de promover/rebaixar membro
- Ação de remover membro
- Botão "Criar usuário" (chama `/api/groups/[groupId]/members/create-user`)

---

### `invites-manager`

**Tipo:** Client Component

**Descrição:** Gerenciamento de links e códigos de convite do grupo.

**Props principais:**
- `groupId: string`
- `invites: Invite[]`

**Funcionalidades:**
- Exibe o código de convite padrão com botão de copiar
- Regenera o código padrão
- Lista convites extras criados manualmente
- Revoga convites individuais
- Cria novos convites com data de expiração opcional

---

### `join-group-form`

**Tipo:** Client Component

**Descrição:** Formulário para o usuário digitar o código de convite e entrar em um grupo.

**Props principais:**
- `onSuccess: (groupId: string) => void`

**Processo:**
1. Usuário digita o código
2. POST para `/api/groups/join` com `{ inviteCode }`
3. Em caso de sucesso, redireciona para o grupo

---

## Tabelas do Banco de Dados

### `groups`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `name` | VARCHAR | Nome do grupo |
| `description` | TEXT | Descrição opcional |
| `type` | VARCHAR | `athletic` ou `pelada` |
| `privacy` | VARCHAR | `public` ou `private` |
| `parent_group_id` | UUID FK | Referência ao grupo pai (apenas peladas) |
| `owner_id` | UUID FK | Usuário criador/dono |
| `invite_code` | VARCHAR UNIQUE | Código padrão de convite |
| `logo_url` | TEXT | URL do logo do grupo |
| `is_active` | BOOLEAN | Soft delete |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### `group_members`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Referência ao grupo |
| `user_id` | UUID FK | Referência ao usuário |
| `role` | VARCHAR | `admin` ou `player` |
| `status` | VARCHAR | `active`, `inactive`, `banned` |
| `joined_at` | TIMESTAMP | Data de entrada no grupo |

### `invites`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Referência ao grupo |
| `code` | VARCHAR UNIQUE | Código único do convite |
| `created_by` | UUID FK | Admin que criou |
| `expires_at` | TIMESTAMP | Data de expiração (nullable) |
| `max_uses` | INTEGER | Limite de usos (nullable = ilimitado) |
| `use_count` | INTEGER | Contador de usos |
| `is_active` | BOOLEAN | Se o convite está ativo |
| `created_at` | TIMESTAMP | Data de criação |

### `venues`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo proprietário |
| `name` | VARCHAR | Nome do local |
| `address` | TEXT | Endereço completo |
| `maps_url` | TEXT | Link do Google Maps |
| `is_active` | BOOLEAN | Soft delete |

---

## Hierarquia de Grupos

```
Athletic (tipo: athletic)
├── Pelada A (tipo: pelada, parent_group_id = athletic.id)
├── Pelada B (tipo: pelada, parent_group_id = athletic.id)
└── Pelada C (tipo: pelada, parent_group_id = athletic.id)
```

**Regras:**
- Máximo de 2 níveis de hierarquia
- Um grupo `pelada` deve ter um `parent_group_id` apontando para um grupo `athletic`
- Um grupo `athletic` não pode ter `parent_group_id`
- Membros de uma pelada podem, opcionalmente, ser membros da atlética pai
- Não é possível criar sub-grupos de peladas (profundidade máxima = 2)

---

## Fluxo de Criação de Grupo

```
1. Admin acessa /groups/new
        |
2. Preenche o formulário (nome, tipo, privacidade)
        |
3. POST /api/groups com os dados
        |
4. Backend valida os dados e permissões
        |
5. INSERT na tabela groups
        |
6. INSERT na tabela group_members (owner como admin)
        |
7. Cria carteira financeira (INSERT em wallets)
        |
8. Gera código de convite padrão (INSERT em invites)
        |
9. Retorna o grupo criado com 201 Created
        |
10. Frontend redireciona para /groups/[groupId]
```

---

## Fluxo de Ingresso em Grupo (Join)

```
1. Usuário acessa /groups/join ou recebe link de convite
        |
2. Digita ou recebe o código de convite
        |
3. POST /api/groups/join { inviteCode }
        |
4. Backend valida:
   - Convite existe e está ativo
   - Convite não expirou
   - Convite não atingiu max_uses
   - Usuário não é já membro
        |
5. INSERT em group_members (role: player, status: active)
6. Incrementa use_count no convite
        |
7. Retorna o groupId
        |
8. Frontend redireciona para /groups/[groupId]
```

---

## Fluxo de Criação de Usuário pelo Admin

O endpoint `POST /api/groups/[groupId]/members/create-user` permite que um administrador crie uma conta para outro usuário e já o adicione ao grupo diretamente, sem necessidade de convite.

**Processo:**
1. Admin preenche nome, e-mail e senha temporária
2. POST para `/api/groups/[groupId]/members/create-user`
3. Backend cria o usuário na tabela `users` (com hash da senha)
4. Insere o usuário em `group_members` com `role: player`
5. Retorna os dados do novo membro

---

## Tipos de Grupo e Privacidade

| Tipo | `privacy` | Comportamento |
|------|-----------|---------------|
| `athletic` | `public` | Qualquer usuário pode encontrar e pedir para entrar |
| `athletic` | `private` | Somente via convite |
| `pelada` | `public` | Visível para membros da atlética pai |
| `pelada` | `private` | Somente via convite explícito |

---

## Automações na Criação

Ao criar um grupo, o backend executa automaticamente:

1. **Criação da Carteira (Wallet):** INSERT em `wallets` com `balance = 0` e `group_id` do novo grupo. Serve como base para o módulo financeiro.

2. **Código de Convite Padrão:** INSERT em `invites` com `is_default = true`, `max_uses = null` (ilimitado), sem data de expiração. O código é gerado aleatoriamente (ex: nanoid de 8 caracteres).

---

## Papéis e Permissões

| Ação | `player` | `admin` |
|------|----------|---------|
| Ver informações do grupo | Sim | Sim |
| Editar informações do grupo | Não | Sim |
| Gerenciar membros | Não | Sim |
| Criar/revogar convites | Não | Sim |
| Criar eventos | Não | Sim |
| Ver configurações de pagamento | Não | Sim |
| Excluir o grupo | Não | Sim (owner) |
| Criar usuários | Não | Sim |

---

## Notas de Implementação

- O `GroupContext` no frontend mantém o `groupId` ativo da sessão do usuário, alimentando os demais módulos
- A troca de grupo ativo é feita via `POST /api/groups/switch`, que atualiza um cookie de sessão
- A listagem de grupos em `/api/groups` filtra apenas grupos onde o usuário é membro ativo
- Soft delete em grupos usa a flag `is_active = false`; os dados dos membros, eventos e transações são preservados
