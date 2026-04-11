# ResenhApp V2.0 — Schema Completo do Banco de Dados

> FATO (do código) — extraído de backups/schema.sql (791KB) + supabase/migrations/ (24 arquivos)

---

## Tipos Enumerados (ENUMs / Custom Types)

O banco define 14+ tipos customizados via `CREATE TYPE`:

| Tipo | Valores |
|------|---------|
| `sport_modality_type` | `futsal`, `futebol`, `society`, `beach_soccer` |
| `group_role_type` | `owner`, `admin`, `moderator`, `member` |
| `event_privacy_type` | `private`, `public` |
| `rsvp_status_type` | `yes`, `no`, `maybe`, `waitlist` |
| `event_action_type` | `goal`, `assist`, `own_goal`, `yellow_card`, `red_card`, `save`, `penalty_scored`, `penalty_missed` |
| `notification_type_type` | `event_created`, `event_updated`, `event_cancelled`, `event_reminder`, `rsvp_confirmed`, `waitlist_moved`, `team_drawn`, `payment_request`, `payment_received`, `achievement_unlocked`, `group_invite` |
| `notification_channel_type` | `push`, `email`, `sms`, `in_app` |
| `payment_status_type` | `pending`, `paid`, `cancelled`, `refunded` |
| `transaction_type_type` | `charge`, `payment`, `refund`, `adjustment` |
| `pix_key_type` | `cpf`, `cnpj`, `email`, `phone`, `random` |
| `achievement_category_type` | `goals`, `assists`, `participation`, `streak`, `special` |
| `platform_role_type` | `player`, `organizer`, `admin`, `super_admin` |
| `player_position_type` | goleiro, zagueiro, lateral_direito, lateral_esquerdo, volante, meia, meia_atacante, ponta_direita, ponta_esquerda, centroavante, atacante |
| `event_status_type` | `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled` |

---

## Tabelas (47 tabelas)

### Core — Usuários e Autenticação

#### `users`
Tabela de usuários gerenciada pelo NextAuth (`@auth/pg-adapter`).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| `email` | TEXT | UNIQUE NOT NULL | Email de login |
| `password_hash` | TEXT | | Hash bcrypt da senha |
| `name` | TEXT | | Nome completo |
| `image` | TEXT | | URL do avatar |
| `email_verified` | TIMESTAMPTZ | | Data de verificação do email |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação do registro |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Última atualização |

#### `profiles`
Perfil estendido do usuário na plataforma ResenhApp.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | Mesmo ID do usuário |
| `code` | TEXT | UNIQUE | Código público do perfil (ex: @joao123) |
| `full_name` | TEXT | | Nome completo |
| `display_name` | TEXT | | Nome exibido publicamente |
| `nickname` | TEXT | | Apelido |
| `bio` | TEXT | | Biografia |
| `avatar_url` | TEXT | | URL da foto de perfil |
| `platform_role` | `platform_role_type` | DEFAULT 'player' | Papel na plataforma |
| `can_create_groups` | BOOLEAN | DEFAULT false | Permissão para criar grupos |
| `can_manage_platform` | BOOLEAN | GENERATED ALWAYS AS (platform_role IN ('admin','super_admin')) | Derivado do role |
| `preferred_position` | `player_position_type` | | Posição preferida |
| `is_goalkeeper_capable` | BOOLEAN | DEFAULT false | Pode jogar como goleiro |
| `phone` | TEXT | | Telefone |
| `whatsapp` | TEXT | | WhatsApp |
| `city` | TEXT | | Cidade |
| `state` | TEXT | | Estado |
| `country` | TEXT | DEFAULT 'BR' | País |
| `location` | GEOGRAPHY(POINT) | | Coordenadas geográficas |
| `notification_preferences` | JSONB | DEFAULT '{}' | Preferências de notificação |
| `privacy_settings` | JSONB | DEFAULT '{}' | Configurações de privacidade |
| `onboarding_completed` | BOOLEAN | DEFAULT false | Onboarding concluído |
| `terms_accepted_at` | TIMESTAMPTZ | | Aceitação dos termos |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |
| `deleted_at` | TIMESTAMPTZ | | Soft delete |

#### `user_roles`
Papéis de usuário para controle de acesso interno do NextAuth.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | Usuário |
| `role` | TEXT | NOT NULL | Nome do papel |
| `group_id` | BIGINT | FK → groups(id) | Grupo (se papel for de grupo) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

---

### Core — Grupos

#### `groups`
Entidade central que representa um grupo de pelada ou atlética.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador numérico |
| `code` | TEXT | UNIQUE | Código público (ex: BOLA123) |
| `name` | TEXT | NOT NULL | Nome do grupo |
| `description` | TEXT | | Descrição |
| `logo_url` | TEXT | | URL do logo |
| `cover_url` | TEXT | | URL da foto de capa |
| `sport_modality` | `sport_modality_type` | DEFAULT 'futebol' | Modalidade esportiva |
| `privacy` | `event_privacy_type` | DEFAULT 'private' | Visibilidade do grupo |
| `is_active` | BOOLEAN | DEFAULT true | Grupo ativo |
| `created_by` | UUID | FK → users(id) | Criador do grupo |
| `group_type` | TEXT | DEFAULT 'pelada' CHECK IN ('athletic','pelada') | Tipo de grupo |
| `parent_group_id` | UUID | FK → groups(id) | Grupo pai (hierarquia atlética→pelada) |
| `pix_code` | TEXT | | Chave PIX para pagamentos |
| `credits_balance` | DECIMAL(10,2) | DEFAULT 0 | Saldo de créditos atual |
| `credits_purchased` | DECIMAL(10,2) | DEFAULT 0 | Total de créditos comprados |
| `credits_consumed` | DECIMAL(10,2) | DEFAULT 0 | Total de créditos consumidos |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |
| `deleted_at` | TIMESTAMPTZ | | Soft delete |

#### `group_members`
Vínculo entre usuários e grupos, com papéis e permissões.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `user_id` | UUID | FK → users(id) NOT NULL | Usuário |
| `role` | `group_role_type` | DEFAULT 'member' | Papel no grupo |
| `permissions` | JSONB | DEFAULT '{}' | Permissões customizadas |
| `is_goalkeeper` | BOOLEAN | DEFAULT false | É goleiro neste grupo |
| `base_rating` | DECIMAL(5,2) | CHECK (0-100) | Nota base do jogador (0-100) |
| `nickname_in_group` | TEXT | | Apelido específico no grupo |
| `joined_at` | TIMESTAMPTZ | DEFAULT now() | Data de entrada |
| `invited_by` | UUID | FK → users(id) | Quem convidou |
| `is_active` | BOOLEAN | DEFAULT true | Membro ativo |
| `left_at` | TIMESTAMPTZ | | Data de saída |
| — | UNIQUE | (group_id, user_id) | Sem duplicatas |

#### `invites`
Convites de acesso a grupos via link.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `code` | TEXT | UNIQUE NOT NULL | Código único do convite |
| `created_by` | UUID | FK → users(id) | Quem criou |
| `max_uses` | INTEGER | | Limite de usos (NULL = ilimitado) |
| `uses_count` | INTEGER | DEFAULT 0 | Usos realizados |
| `expires_at` | TIMESTAMPTZ | | Data de expiração |
| `is_active` | BOOLEAN | DEFAULT true | Convite ativo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `venues`
Locais de realização dos eventos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) | Grupo dono do local |
| `name` | TEXT | NOT NULL | Nome do local |
| `address` | TEXT | | Endereço completo |
| `city` | TEXT | | Cidade |
| `state` | TEXT | | Estado |
| `location` | GEOGRAPHY(POINT) | | Coordenadas GPS |
| `surface_type` | TEXT | | Tipo de superfície (grama, salão, areia) |
| `has_lighting` | BOOLEAN | DEFAULT false | Tem iluminação |
| `has_parking` | BOOLEAN | DEFAULT false | Tem estacionamento |
| `has_locker_room` | BOOLEAN | DEFAULT false | Tem vestiário |
| `capacity` | INTEGER | | Capacidade de jogadores |
| `is_active` | BOOLEAN | DEFAULT true | Local ativo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

---

### Core — Eventos

#### `events`
Evento de pelada ou treino — entidade central do produto.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `code` | TEXT | UNIQUE | Código público do evento |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo organizador |
| `title` | TEXT | NOT NULL | Título do evento |
| `description` | TEXT | | Descrição |
| `date` | DATE | NOT NULL | Data do evento |
| `time` | TIME | | Horário de início |
| `duration` | INTEGER | | Duração em minutos |
| `venue_id` | BIGINT | FK → venues(id) | Local |
| `max_players` | INTEGER | | Máximo de jogadores |
| `max_goalkeepers` | INTEGER | | Máximo de goleiros |
| `confirmed_count` | INTEGER | DEFAULT 0 | Contagem de confirmados |
| `waitlist_count` | INTEGER | DEFAULT 0 | Contagem na lista de espera |
| `cost_per_player` | DECIMAL(10,2) | DEFAULT 0 | Custo por jogador |
| `status` | `event_status_type` | DEFAULT 'scheduled' | Status do evento |
| `is_teams_drawn` | BOOLEAN | DEFAULT false | Times já sorteados |
| `privacy` | `event_privacy_type` | DEFAULT 'private' | Visibilidade |
| `allow_waitlist` | BOOLEAN | DEFAULT true | Permite lista de espera |
| `auto_confirm_from_waitlist` | BOOLEAN | DEFAULT true | Auto-confirma da fila |
| `created_by` | UUID | FK → users(id) | Criador |
| `is_recurring` | BOOLEAN | DEFAULT false | Evento recorrente |
| `recurrence_pattern` | JSONB | | Padrão de recorrência |
| `event_type` | TEXT | DEFAULT 'training' CHECK IN ('training','official_game','friendly') | Tipo de evento |
| `parent_event_id` | BIGINT | FK → events(id) | Evento pai (recorrência) |
| `modality_id` | UUID | FK → sport_modalities(id) | Modalidade específica |
| `receiver_profile_id` | UUID | FK → receiver_profiles(id) | Perfil recebedor de PIX |
| `price` | DECIMAL(10,2) | | Preço para cobrança automática |
| `auto_charge_on_rsvp` | BOOLEAN | DEFAULT false | Cobra automaticamente ao confirmar presença |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

#### `event_attendance`
Confirmação de presença (RSVP) de cada jogador em cada evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `event_id` | BIGINT | FK → events(id) NOT NULL | Evento |
| `user_id` | UUID | FK → users(id) NOT NULL | Jogador |
| `group_id` | BIGINT | FK → groups(id) | Grupo (denormalizado para RLS) |
| `status` | `rsvp_status_type` | NOT NULL | Status da confirmação |
| `attending_as_goalkeeper` | BOOLEAN | DEFAULT false | Vai como goleiro |
| `order_of_arrival` | INTEGER | | Ordem de chegada (para fila de espera) |
| `checked_in` | BOOLEAN | DEFAULT false | Fez check-in no local |
| `has_paid` | BOOLEAN | DEFAULT false | Pagamento realizado |
| `paid_amount` | DECIMAL(10,2) | | Valor pago |
| `paid_at` | TIMESTAMPTZ | | Data do pagamento |
| — | UNIQUE | (event_id, user_id) | Sem duplicatas por evento |

#### `teams`
Times sorteados para um evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `event_id` | BIGINT | FK → events(id) NOT NULL | Evento |
| `name` | TEXT | NOT NULL | Nome do time |
| `color` | TEXT | | Cor do time (hex: #FF5733) |
| `number` | INTEGER | NOT NULL | Número do time no evento |
| `score` | INTEGER | DEFAULT 0 | Placar atual |
| — | UNIQUE | (event_id, number) | Número único por evento |

#### `team_members`
Jogadores alocados em cada time de um evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `team_id` | BIGINT | FK → teams(id) NOT NULL | Time |
| `event_id` | BIGINT | FK → events(id) NOT NULL | Evento (denormalizado) |
| `user_id` | UUID | FK → users(id) NOT NULL | Jogador |
| `is_goalkeeper` | BOOLEAN | DEFAULT false | Joga como goleiro |
| `position` | TEXT | | Posição |
| `formation_position` | TEXT | | Posição na formação tática |
| `is_captain` | BOOLEAN | DEFAULT false | É capitão do time |
| — | UNIQUE | (team_id, user_id) | Sem duplicatas por time |
| — | UNIQUE | (event_id, user_id) | Jogador em apenas 1 time por evento |

#### `event_actions`
Eventos ocorridos durante a partida (gols, assistências, cartões).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `event_id` | BIGINT | FK → events(id) NOT NULL | Partida |
| `team_id` | BIGINT | FK → teams(id) | Time |
| `user_id` | UUID | FK → users(id) | Jogador |
| `action_type` | `event_action_type` | NOT NULL | Tipo da ação |
| `assisted_by` | UUID | FK → users(id) | Jogador que assistiu (gols) |
| `minute` | INTEGER | | Minuto da ação |
| `period` | INTEGER | | Período (1, 2, prorrogação) |
| `recorded_by` | UUID | FK → users(id) | Quem registrou |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `votes`
Avaliações de desempenho entre jogadores pós-evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `event_id` | BIGINT | FK → events(id) NOT NULL | Evento |
| `voter_id` | UUID | FK → users(id) NOT NULL | Quem votou |
| `voted_for_id` | UUID | FK → users(id) NOT NULL | Quem recebeu |
| `vote_value` | INTEGER | CHECK (1-5) | Nota de 1 a 5 |
| `category` | TEXT | NOT NULL | Categoria da avaliação |
| — | UNIQUE | (event_id, voter_id, voted_for_id, category) | Sem votos duplicados |
| — | CHECK | voter_id != voted_for_id | Não pode votar em si mesmo |

---

### Financeiro

#### `wallets`
Carteira financeira de cada grupo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) UNIQUE NOT NULL | Grupo (1:1) |
| `balance` | DECIMAL(10,2) | DEFAULT 0 | Saldo disponível |
| `total_received` | DECIMAL(10,2) | DEFAULT 0 | Total recebido |
| `total_distributed` | DECIMAL(10,2) | DEFAULT 0 | Total distribuído |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

#### `charges`
Cobranças criadas pelo organizador para um evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `event_id` | BIGINT | FK → events(id) | Evento (opcional) |
| `title` | TEXT | NOT NULL | Título da cobrança |
| `description` | TEXT | | Descrição |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Valor total |
| `amount_per_player` | DECIMAL(10,2) | | Valor por jogador |
| `status` | `payment_status_type` | DEFAULT 'pending' | Status geral |
| `due_date` | DATE | | Data de vencimento |
| `created_by` | UUID | FK → users(id) | Criador da cobrança |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

#### `charge_splits`
Divisão de uma cobrança por jogador.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `charge_id` | BIGINT | FK → charges(id) NOT NULL | Cobrança |
| `user_id` | UUID | FK → users(id) NOT NULL | Jogador |
| `group_id` | BIGINT | FK → groups(id) | Grupo (denormalizado para RLS) |
| `amount` | DECIMAL(10,2) | NOT NULL | Valor desta parcela |
| `status` | `payment_status_type` | DEFAULT 'pending' | Status do pagamento |
| `paid_at` | TIMESTAMPTZ | | Data do pagamento |
| `pix_payment_id` | BIGINT | FK → pix_payments(id) | Pagamento PIX vinculado |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

#### `transactions`
Histórico de transações financeiras.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `wallet_id` | BIGINT | FK → wallets(id) NOT NULL | Carteira |
| `user_id` | UUID | FK → users(id) | Usuário |
| `group_id` | BIGINT | FK → groups(id) | Grupo |
| `type` | `transaction_type_type` | NOT NULL | Tipo da transação |
| `amount` | DECIMAL(10,2) | NOT NULL | Valor |
| `description` | TEXT | | Descrição |
| `reference_id` | TEXT | | ID de referência externa |
| `metadata` | JSONB | DEFAULT '{}' | Dados extras |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `pix_payments`
Registro de pagamentos via PIX.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `charge_id` | BIGINT | FK → charges(id) | Cobrança |
| `payer_id` | UUID | FK → users(id) | Pagador |
| `amount` | DECIMAL(10,2) | NOT NULL | Valor |
| `status` | `payment_status_type` | DEFAULT 'pending' | Status |
| `pix_key` | TEXT | | Chave PIX do recebedor |
| `pix_key_type` | `pix_key_type` | | Tipo da chave |
| `e2e_id` | TEXT | UNIQUE | ID de transação E2E |
| `qr_code` | TEXT | | QR Code PIX |
| `proof_url` | TEXT | | URL do comprovante |
| `paid_at` | TIMESTAMPTZ | | Data do pagamento |
| `confirmed_by` | UUID | FK → users(id) | Quem confirmou |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

#### `receiver_profiles`
Perfis de recebimento PIX vinculados a usuários.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `user_id` | UUID | FK → users(id) NOT NULL | Usuário dono |
| `pix_key` | TEXT | NOT NULL | Chave PIX |
| `pix_key_type` | `pix_key_type` | NOT NULL | Tipo |
| `holder_name` | TEXT | NOT NULL | Nome do titular |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `is_default` | BOOLEAN | DEFAULT false | Chave padrão |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `group_pix_config`
Configuração PIX por grupo para cobranças automáticas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) UNIQUE NOT NULL | Grupo (1:1) |
| `receiver_profile_id` | UUID | FK → receiver_profiles(id) | Perfil recebedor |
| `auto_generate_charge` | BOOLEAN | DEFAULT false | Gerar cobranças automaticamente |
| `charge_on_rsvp` | BOOLEAN | DEFAULT false | Cobrar ao confirmar presença |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

---

### Notificações

#### `notifications`
Notificações enviadas aos usuários.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `user_id` | UUID | FK → users(id) NOT NULL | Destinatário |
| `type` | `notification_type_type` | NOT NULL | Tipo de notificação |
| `title` | TEXT | NOT NULL | Título |
| `body` | TEXT | NOT NULL | Corpo da mensagem |
| `data` | JSONB | DEFAULT '{}' | Dados extras |
| `channel` | `notification_channel_type` | DEFAULT 'in_app' | Canal de envio |
| `is_read` | BOOLEAN | DEFAULT false | Lida |
| `read_at` | TIMESTAMPTZ | | Data de leitura |
| `group_id` | BIGINT | FK → groups(id) | Grupo relacionado |
| `event_id` | BIGINT | FK → events(id) | Evento relacionado |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `notification_templates`
Templates de notificação reutilizáveis.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `type` | `notification_type_type` | UNIQUE NOT NULL | Tipo (1 template por tipo) |
| `title_template` | TEXT | NOT NULL | Template do título com variáveis |
| `body_template` | TEXT | NOT NULL | Template do corpo com variáveis |
| `channels` | `notification_channel_type`[] | | Canais habilitados |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

#### `push_tokens`
Tokens de dispositivo para push notifications.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `user_id` | UUID | FK → users(id) NOT NULL | Usuário |
| `token` | TEXT | UNIQUE NOT NULL | Token FCM/APNs |
| `platform` | TEXT | CHECK IN ('ios','android','web') | Plataforma |
| `is_active` | BOOLEAN | DEFAULT true | Token ativo |
| `last_used_at` | TIMESTAMPTZ | | Último uso |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `email_queue`
Fila de envio de emails.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `to_email` | TEXT | NOT NULL | Destinatário |
| `subject` | TEXT | NOT NULL | Assunto |
| `body_html` | TEXT | NOT NULL | Corpo HTML |
| `status` | TEXT | DEFAULT 'pending' | Status: pending, sent, failed |
| `attempts` | INTEGER | DEFAULT 0 | Tentativas de envio |
| `sent_at` | TIMESTAMPTZ | | Data de envio |
| `error` | TEXT | | Erro (se falhou) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `notification_batches`
Batches de notificações para envio em massa.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) | Grupo alvo |
| `event_id` | BIGINT | FK → events(id) | Evento relacionado |
| `type` | `notification_type_type` | NOT NULL | Tipo |
| `total_sent` | INTEGER | DEFAULT 0 | Total enviado |
| `total_failed` | INTEGER | DEFAULT 0 | Total com falha |
| `created_by` | UUID | FK → users(id) | Quem criou |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `completed_at` | TIMESTAMPTZ | | Conclusão |

---

### Analytics

#### `player_stats`
Estatísticas agregadas por jogador e grupo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `user_id` | UUID | FK → users(id) NOT NULL | Jogador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `events_played` | INTEGER | DEFAULT 0 | Eventos jogados |
| `events_missed` | INTEGER | DEFAULT 0 | Eventos perdidos |
| `goals` | INTEGER | DEFAULT 0 | Gols marcados |
| `assists` | INTEGER | DEFAULT 0 | Assistências |
| `own_goals` | INTEGER | DEFAULT 0 | Gols contra |
| `yellow_cards` | INTEGER | DEFAULT 0 | Cartões amarelos |
| `red_cards` | INTEGER | DEFAULT 0 | Cartões vermelhos |
| `saves` | INTEGER | DEFAULT 0 | Defesas (goleiro) |
| `average_rating` | DECIMAL(5,2) | | Nota média |
| `current_streak` | INTEGER | DEFAULT 0 | Sequência atual de presenças |
| `best_streak` | INTEGER | DEFAULT 0 | Melhor sequência |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |
| — | UNIQUE | (user_id, group_id) | Uma stat por jogador por grupo |

#### `event_stats`
Estatísticas agregadas por evento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `event_id` | BIGINT | FK → events(id) UNIQUE NOT NULL | Evento (1:1) |
| `total_players` | INTEGER | DEFAULT 0 | Total de jogadores |
| `total_goals` | INTEGER | DEFAULT 0 | Total de gols |
| `top_scorer_id` | UUID | FK → users(id) | Artilheiro |
| `average_rating` | DECIMAL(5,2) | | Nota média geral |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

#### `group_stats`
Estatísticas agregadas por grupo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) UNIQUE NOT NULL | Grupo (1:1) |
| `total_events` | INTEGER | DEFAULT 0 | Total de eventos |
| `total_players` | INTEGER | DEFAULT 0 | Total de jogadores |
| `total_goals` | INTEGER | DEFAULT 0 | Total de gols na história |
| `most_active_player_id` | UUID | FK → users(id) | Jogador mais ativo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

#### `leaderboards`
Ranking de jogadores por período e categoria.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `category` | TEXT | NOT NULL | Categoria: goals, assists, rating, attendance |
| `period_type` | TEXT | CHECK IN ('weekly','monthly','season','all_time') | Período |
| `period_start` | DATE | NOT NULL | Início do período |
| `period_end` | DATE | | Fim do período |
| `rankings` | JSONB | NOT NULL | Array de rankings [{user_id, value, rank}] |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |
| — | UNIQUE | (group_id, category, period_type, period_start) | Sem duplicatas |

#### `activity_log`
Log de atividades para auditoria.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `user_id` | UUID | FK → users(id) | Ator |
| `group_id` | BIGINT | FK → groups(id) | Grupo afetado |
| `action` | TEXT | NOT NULL | Ação realizada |
| `entity_type` | TEXT | | Tipo de entidade (event, member, etc.) |
| `entity_id` | TEXT | | ID da entidade afetada |
| `metadata` | JSONB | DEFAULT '{}' | Dados adicionais |
| `ip_address` | TEXT | | IP do ator |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

---

### Gamificação

#### `achievement_types`
Definição dos tipos de conquistas disponíveis.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `code` | TEXT | UNIQUE NOT NULL | Código único (ex: FIRST_GOAL) |
| `name` | TEXT | NOT NULL | Nome exibido |
| `description` | TEXT | | Descrição |
| `category` | `achievement_category_type` | NOT NULL | Categoria |
| `icon_url` | TEXT | | URL do ícone |
| `points` | INTEGER | DEFAULT 0 | Pontos concedidos |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `criteria` | JSONB | | Critérios para desbloquear |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `user_achievements`
Conquistas desbloqueadas por usuário.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `user_id` | UUID | FK → users(id) NOT NULL | Usuário |
| `achievement_type_id` | UUID | FK → achievement_types(id) NOT NULL | Tipo de conquista |
| `group_id` | BIGINT | FK → groups(id) | Grupo onde foi conquistado |
| `unlocked_at` | TIMESTAMPTZ | DEFAULT now() | Data de desbloqueio |
| `metadata` | JSONB | DEFAULT '{}' | Dados do contexto |

#### `badges`
Selos/emblemas visuais disponíveis.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `code` | TEXT | UNIQUE NOT NULL | Código único |
| `name` | TEXT | NOT NULL | Nome |
| `description` | TEXT | | Descrição |
| `icon_url` | TEXT | | URL do ícone |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `user_badges`
Badges concedidos a usuários.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `user_id` | UUID | FK → users(id) NOT NULL | Usuário |
| `badge_id` | UUID | FK → badges(id) NOT NULL | Badge |
| `group_id` | BIGINT | FK → groups(id) | Grupo contexto |
| `granted_at` | TIMESTAMPTZ | DEFAULT now() | Data da concessão |
| `granted_by` | UUID | FK → users(id) | Quem concedeu |

#### `milestones`
Marcos de evolução para os jogadores.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `user_id` | UUID | FK → users(id) NOT NULL | Usuário |
| `group_id` | BIGINT | FK → groups(id) | Grupo |
| `type` | TEXT | NOT NULL | Tipo do marco |
| `value` | INTEGER | NOT NULL | Valor atingido |
| `reached_at` | TIMESTAMPTZ | DEFAULT now() | Data |

#### `challenges`
Desafios criados para grupos ou temporadas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `title` | TEXT | NOT NULL | Título |
| `description` | TEXT | | Descrição |
| `type` | TEXT | NOT NULL | Tipo do desafio |
| `criteria` | JSONB | NOT NULL | Critérios de conclusão |
| `reward_points` | INTEGER | DEFAULT 0 | Pontos de recompensa |
| `starts_at` | TIMESTAMPTZ | NOT NULL | Início |
| `ends_at` | TIMESTAMPTZ | NOT NULL | Fim |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `created_by` | UUID | FK → users(id) | Criador |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `challenge_participants`
Participantes de cada desafio.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `challenge_id` | UUID | FK → challenges(id) NOT NULL | Desafio |
| `user_id` | UUID | FK → users(id) NOT NULL | Participante |
| `progress` | JSONB | DEFAULT '{}' | Progresso atual |
| `completed` | BOOLEAN | DEFAULT false | Concluído |
| `completed_at` | TIMESTAMPTZ | | Data de conclusão |
| `joined_at` | TIMESTAMPTZ | DEFAULT now() | Entrada no desafio |

---

### Sport Modalities

#### `sport_modalities`
Modalidades esportivas customizadas por grupo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `name` | TEXT | NOT NULL | Nome da modalidade |
| `description` | TEXT | | Descrição |
| `max_players` | INTEGER | | Máximo de jogadores |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| — | UNIQUE | (group_id, name) | Nome único por grupo |

#### `athlete_modalities`
Vínculo entre atleta e modalidades que pratica.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `user_id` | UUID | FK → users(id) NOT NULL | Atleta |
| `modality_id` | UUID | FK → sport_modalities(id) NOT NULL | Modalidade |
| `skill_level` | TEXT | CHECK IN ('beginner','intermediate','advanced','professional') | Nível de habilidade |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| — | UNIQUE | (user_id, modality_id) | Sem duplicatas |

---

### Game Management

#### `game_convocations`
Convocações oficiais para eventos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `event_id` | BIGINT | FK → events(id) UNIQUE NOT NULL | Evento (1:1) |
| `deadline` | TIMESTAMPTZ | NOT NULL | Prazo de resposta |
| `message` | TEXT | | Mensagem da convocação |
| `sent_at` | TIMESTAMPTZ | | Data de envio |
| `created_by` | UUID | FK → users(id) | Criador |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `convocation_responses`
Respostas individuais às convocações.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `convocation_id` | UUID | FK → game_convocations(id) NOT NULL | Convocação |
| `user_id` | UUID | FK → users(id) NOT NULL | Jogador |
| `status` | `rsvp_status_type` | NOT NULL | Resposta |
| `message` | TEXT | | Mensagem do jogador |
| `responded_at` | TIMESTAMPTZ | DEFAULT now() | Data da resposta |
| — | UNIQUE | (convocation_id, user_id) | Uma resposta por jogador |

#### `checkin_qrcodes`
QR Codes gerados para check-in em eventos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `event_id` | BIGINT | FK → events(id) NOT NULL | Evento |
| `qr_code_hash` | TEXT | UNIQUE NOT NULL | Hash do QR Code |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Expiração |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `created_by` | UUID | FK → users(id) | Criador |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `checkins`
Registro de check-ins realizados.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador |
| `event_id` | BIGINT | FK → events(id) NOT NULL | Evento |
| `user_id` | UUID | FK → users(id) NOT NULL | Jogador |
| `qr_code_id` | UUID | FK → checkin_qrcodes(id) | QR Code usado |
| `checked_in_at` | TIMESTAMPTZ | DEFAULT now() | Data/hora do check-in |
| `location` | GEOGRAPHY(POINT) | | Localização no check-in |
| — | UNIQUE | (event_id, user_id) | Um check-in por jogador por evento |

#### `saved_tactics`
Formações táticas salvas pelos organizadores.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `name` | TEXT | NOT NULL | Nome da formação |
| `formation` | TEXT | NOT NULL | Tipo (ex: 4-4-2, 4-3-3) |
| `positions` | JSONB | NOT NULL | Posições dos jogadores |
| `created_by` | UUID | FK → users(id) | Criador |
| `is_default` | BOOLEAN | DEFAULT false | Formação padrão |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Atualização |

---

### Créditos & Promos

#### `credit_transactions`
Transações do sistema de créditos da plataforma.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `type` | TEXT | CHECK IN ('purchase','consumption','bonus','refund') | Tipo |
| `amount` | DECIMAL(10,2) | NOT NULL | Quantidade de créditos |
| `description` | TEXT | | Descrição |
| `reference_id` | TEXT | | Referência externa |
| `created_by` | UUID | FK → users(id) | Executado por |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `credit_packages`
Pacotes de créditos disponíveis para compra.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `name` | TEXT | NOT NULL | Nome do pacote |
| `credits` | DECIMAL(10,2) | NOT NULL | Quantidade de créditos |
| `price_brl` | DECIMAL(10,2) | NOT NULL | Preço em BRL |
| `bonus_credits` | DECIMAL(10,2) | DEFAULT 0 | Créditos bônus |
| `is_active` | BOOLEAN | DEFAULT true | Disponível |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `promo_coupons`
Cupons de desconto e promoções.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `code` | TEXT | UNIQUE NOT NULL | Código do cupom |
| `description` | TEXT | | Descrição |
| `discount_type` | TEXT | CHECK IN ('percentage','fixed','credits') | Tipo de desconto |
| `discount_value` | DECIMAL(10,2) | NOT NULL | Valor do desconto |
| `max_uses` | INTEGER | | Limite de usos |
| `uses_count` | INTEGER | DEFAULT 0 | Usos realizados |
| `valid_from` | TIMESTAMPTZ | | Início da validade |
| `valid_until` | TIMESTAMPTZ | | Fim da validade |
| `is_active` | BOOLEAN | DEFAULT true | Ativo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Criação |

#### `coupon_usages`
Registro de uso de cupons por grupo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | BIGSERIAL | PK | Identificador |
| `coupon_id` | BIGINT | FK → promo_coupons(id) NOT NULL | Cupom |
| `group_id` | BIGINT | FK → groups(id) NOT NULL | Grupo |
| `used_by` | UUID | FK → users(id) | Usuário que aplicou |
| `used_at` | TIMESTAMPTZ | DEFAULT now() | Data de uso |
| `discount_applied` | DECIMAL(10,2) | | Desconto aplicado |
| — | UNIQUE | (coupon_id, group_id) | Cupom usado uma vez por grupo |

---

## Views e Materialized Views

### `v_training_payments` (VIEW)
View que agrega informações de pagamento de treinos, cruzando `events`, `event_attendance`, `charges` e `charge_splits`.

**Colunas principais**: event_id, event_date, event_title, group_id, user_id, has_paid, paid_amount, charge_status

### `v_training_payment_details` (VIEW)
View detalhada de pagamentos com informações de perfil do jogador.

**Colunas principais**: Todas de `v_training_payments` + user_name, user_avatar, pix_key

### `mv_top_scorers` (MATERIALIZED VIEW)
Ranking de artilheiros por grupo. Atualizada via trigger em `event_actions`.

**Colunas**: group_id, user_id, user_name, goals, assists, total_score, rank

**Índice**: UNIQUE INDEX ON (group_id, user_id)

### `mv_event_scoreboard` (MATERIALIZED VIEW)
Placar e estatísticas de cada evento. Atualizada ao finalizar evento.

**Colunas**: event_id, group_id, team_id, team_name, score, goals_by_player

---

## Funções PostgreSQL (70+)

### Funções de Grupo

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `is_group_member(group_id BIGINT)` | BOOLEAN | Verifica se auth.uid() é membro do grupo |
| `is_group_admin(group_id BIGINT)` | BOOLEAN | Verifica se auth.uid() é admin/owner |
| `is_group_owner(group_id BIGINT)` | BOOLEAN | Verifica se auth.uid() é owner |
| `can_create_groups()` | BOOLEAN | Verifica platform_role do usuário |
| `has_platform_access()` | BOOLEAN | Verifica se é admin/super_admin |
| `has_group_permission(group_id, permission TEXT)` | BOOLEAN | Verifica permissão customizada no JSONB |
| `get_user_groups(user_id UUID)` | SETOF groups | Retorna grupos do usuário |
| `get_group_member_count(group_id BIGINT)` | INTEGER | Contagem de membros ativos |

### Funções de Evento

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `confirm_attendance(event_id, user_id)` | BOOLEAN | Confirma presença e gerencia fila |
| `cancel_attendance(event_id, user_id)` | BOOLEAN | Cancela e promove da lista de espera |
| `draw_teams(event_id BIGINT, num_teams INTEGER)` | JSONB | Sorteia times balanceados |
| `record_event_action(event_id, team_id, user_id, action_type)` | BIGINT | Registra ação no placar |
| `complete_event(event_id BIGINT)` | VOID | Finaliza evento e atualiza stats |
| `get_event_rsvp_summary(event_id BIGINT)` | JSONB | Resumo de confirmações |
| `promote_from_waitlist(event_id BIGINT)` | INTEGER | Promove jogadores da fila |

### Funções Financeiras

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `create_event_charges(event_id BIGINT)` | BIGINT | Cria cobranças para o evento |
| `confirm_pix_payment(pix_payment_id, confirmed_by)` | BOOLEAN | Confirma pagamento PIX |
| `get_group_balance(group_id BIGINT)` | DECIMAL | Saldo da carteira do grupo |
| `apply_credit_consumption(group_id, amount, description)` | BOOLEAN | Consume créditos do grupo |
| `split_charge_equally(charge_id BIGINT)` | VOID | Divide cobrança igualmente |

### Funções de Analytics

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `update_player_stats(user_id, group_id)` | VOID | Recalcula stats do jogador |
| `update_event_stats(event_id BIGINT)` | VOID | Recalcula stats do evento |
| `update_group_stats(group_id BIGINT)` | VOID | Recalcula stats do grupo |
| `refresh_leaderboard(group_id, category, period_type)` | VOID | Atualiza ranking |
| `get_player_ranking(group_id, category, limit)` | JSONB | Retorna ranking de jogadores |
| `calculate_player_rating(user_id, group_id)` | DECIMAL | Calcula nota do jogador |

### Funções de Gamificação

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `check_achievements(user_id, group_id)` | VOID | Verifica e desbloqueia conquistas |
| `grant_badge(user_id, badge_code, group_id)` | BOOLEAN | Concede badge ao jogador |
| `check_milestones(user_id, group_id)` | VOID | Verifica marcos atingidos |
| `get_user_achievement_summary(user_id)` | JSONB | Resumo de conquistas |

### Funções de Notificação

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `notify_event_members(event_id, type)` | INTEGER | Notifica todos os membros do evento |
| `send_rsvp_confirmation(event_id, user_id)` | VOID | Envia confirmação de presença |
| `create_notification(user_id, type, data)` | BIGINT | Cria notificação individual |
| `batch_notify_group(group_id, type, data)` | VOID | Notificação em massa para grupo |

### Funções Utilitárias

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `generate_unique_code(prefix TEXT, length INT)` | TEXT | Gera código único alfanumérico |
| `generate_event_code()` | TEXT | Gera código único de evento |
| `generate_group_code()` | TEXT | Gera código único de grupo |
| `generate_invite_code()` | TEXT | Gera código de convite |
| `handle_updated_at()` | TRIGGER | Atualiza campo updated_at automaticamente |
| `soft_delete(table_name TEXT, record_id)` | VOID | Realiza soft delete |

---

## Triggers (22+)

| Trigger | Tabela | Evento | Função | Ação |
|---------|--------|--------|--------|------|
| `trg_users_updated_at` | users | BEFORE UPDATE | handle_updated_at() | Atualiza updated_at |
| `trg_profiles_updated_at` | profiles | BEFORE UPDATE | handle_updated_at() | Atualiza updated_at |
| `trg_groups_updated_at` | groups | BEFORE UPDATE | handle_updated_at() | Atualiza updated_at |
| `trg_events_updated_at` | events | BEFORE UPDATE | handle_updated_at() | Atualiza updated_at |
| `trg_event_attendance_updated_at` | event_attendance | BEFORE UPDATE | handle_updated_at() | Atualiza updated_at |
| `trg_profile_on_user_create` | users | AFTER INSERT | create_profile_on_signup() | Cria profile automaticamente |
| `trg_update_confirmed_count` | event_attendance | AFTER INSERT/UPDATE/DELETE | update_event_confirmed_count() | Mantém confirmed_count sincronizado |
| `trg_update_waitlist_count` | event_attendance | AFTER INSERT/UPDATE/DELETE | update_event_waitlist_count() | Mantém waitlist_count sincronizado |
| `trg_auto_promote_waitlist` | event_attendance | AFTER UPDATE | auto_promote_from_waitlist() | Promove jogador da fila automaticamente |
| `trg_update_player_stats_on_action` | event_actions | AFTER INSERT | update_player_stats_on_action() | Atualiza stats ao registrar ação |
| `trg_refresh_top_scorers` | event_actions | AFTER INSERT/UPDATE/DELETE | refresh_mv_top_scorers() | Atualiza materialized view |
| `trg_refresh_scoreboard` | event_actions | AFTER INSERT/UPDATE/DELETE | refresh_mv_event_scoreboard() | Atualiza placar |
| `trg_check_achievements_on_action` | event_actions | AFTER INSERT | check_achievements_on_action() | Verifica conquistas |
| `trg_check_milestones_on_stats` | player_stats | AFTER UPDATE | check_milestones_on_stats() | Verifica marcos |
| `trg_notify_on_event_create` | events | AFTER INSERT | notify_group_on_event_create() | Notifica membros do grupo |
| `trg_notify_rsvp_confirmation` | event_attendance | AFTER UPDATE | notify_rsvp_status_change() | Notifica mudança de RSVP |
| `trg_update_charge_status` | charge_splits | AFTER UPDATE | update_parent_charge_status() | Atualiza status da cobrança pai |
| `trg_update_group_stats` | event_attendance | AFTER INSERT | update_group_stats_on_attendance() | Atualiza stats do grupo |
| `trg_credit_balance_update` | credit_transactions | AFTER INSERT | update_group_credit_balance() | Atualiza saldo de créditos |
| `trg_generate_event_code` | events | BEFORE INSERT | set_event_code() | Gera código se não informado |
| `trg_generate_group_code` | groups | BEFORE INSERT | set_group_code() | Gera código se não informado |
| `trg_generate_invite_code` | invites | BEFORE INSERT | set_invite_code() | Gera código se não informado |

---

## Storage Buckets

| Bucket | Tamanho máx | Tipo | Propósito |
|--------|-------------|------|-----------|
| `avatars` | 2MB | Público | Fotos de perfil dos usuários |
| `group-photos` | 5MB | Público | Logo e fotos de capa dos grupos |
| `venue-photos` | 5MB | Público | Fotos dos locais de jogo |
| `receipts` | 10MB | Privado | Comprovantes de pagamento PIX |

**Políticas de Storage**:
- Buckets públicos: leitura anônima permitida, escrita requer autenticação
- Bucket `receipts`: leitura restrita ao proprietário e admins do grupo, escrita requer autenticação

---

## Realtime

Tabelas com Realtime habilitado no Supabase:

| Tabela | Casos de Uso |
|--------|-------------|
| `events` | Atualização de status em tempo real |
| `event_attendance` | Contagem de confirmados ao vivo |
| `event_actions` | Placar ao vivo durante partida |
| `notifications` | Notificações push em tempo real |
| `teams` | Sorteio de times em tempo real |
| `team_members` | Alocação de jogadores em tempo real |

---

## Extensões PostgreSQL

| Extensão | Versão | Propósito |
|----------|--------|-----------|
| `uuid-ossp` | 1.1 | Geração de UUIDs v4 |
| `pgcrypto` | 1.3 | Funções de criptografia (gen_random_uuid) |
| `pg_trgm` | 1.6 | Busca por trigrama (ILIKE otimizado) |
| `postgis` | 3.x | Tipos e funções geográficas (GEOGRAPHY, ST_Distance) |
| `pg_graphql` | 1.x | API GraphQL automática (Supabase) |
| `pg_stat_statements` | 1.10 | Monitoramento de performance de queries |
| `supabase_vault` | 0.2.8 | Armazenamento seguro de secrets |
| `pg_net` | 0.7 | Chamadas HTTP de dentro do PostgreSQL (webhooks) |

---

## Divergências: Migrations vs Backup

| Aspecto | migrations/ (24 arquivos) | backups/schema.sql (791KB) | Diagnóstico |
|---------|--------------------------|---------------------------|-------------|
| **Fonte** | Arquivos individuais por sprint | Dump completo do banco de dados | O backup é autoritativo |
| **Data mais recente** | 20260127000010 | Gerado em fev/2026 | Backup é mais atualizado |
| **Tabela `events.price`** | Ausente nas primeiras migrations | Presente no backup | Adicionada via migration tardia |
| **Tabela `events.auto_charge_on_rsvp`** | Apenas em migration 20260127000008 | Presente no backup | Consistente |
| **Tabela `receiver_profiles`** | Definida em migration de pagamentos | Presente no backup | Consistente |
| **ENUMs adicionais** | Alguns ENUMs não aparecem em migrations antigas | Todos presentes no backup | Backup é completo |
| **Funções PostgreSQL** | Parcialmente documentadas nas migrations | 70+ funções no backup | Backup tem mais funções |
| **Triggers** | ~15 declarados em migrations | 22+ no backup | Alguns triggers adicionados diretamente |
| **Materialized Views** | Não declaradas nas migrations | Presentes no backup | Criadas fora do fluxo de migrations |
| **RLS Policies** | migration 20260127000004 | Repetidas no backup | Consistentes |
| **Schema `auth`** | Referenciado (FK auth.users) | Gerenciado pelo Supabase | auth schema não está em migrations |

**Conclusão**: O arquivo `backups/schema.sql` (791KB) é a fonte de verdade do estado atual do banco. As migrations representam a evolução histórica mas podem não estar 100% sincronizadas com o estado atual.
