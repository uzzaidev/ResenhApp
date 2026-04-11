# ResenhApp V2.0 — Inventário Completo de Rotas
> FATO (do código) — extraído de src/app/**/page.tsx e src/app/api/**/route.ts

## Páginas (page.tsx)

| Rota | Tipo | Auth Guard | Propósito |
|------|------|-----------|-----------|
| `/` | Server | Nenhum | Landing page pública |
| `/auth/signin` | Client | Nenhum → redirect /dashboard | Login |
| `/auth/signup` | Client | Nenhum → redirect /auth/signin | Cadastro |
| `/auth/error` | Client | Nenhum | Exibe erro de autenticação |
| `/simple-test` | Server | Nenhum | Healthcheck (sem BD) |
| `/groups/join` | Server | getCurrentUser() | Entrar em grupo via código |
| `/groups/new` | Server | getCurrentUser() | Criar novo grupo |
| `/groups/[groupId]` | Server | getCurrentUser() + membro | Página do grupo |
| `/groups/[groupId]/settings` | Server | Admin | Configurações do grupo |
| `/dashboard` | Server | getCurrentUser() | Dashboard principal |
| `/(dashboard)/atletas` | Client | GroupContext | Gestão de atletas |
| `/(dashboard)/atletas/[id]` | Server | getCurrentUser() | Perfil do atleta |
| `/(dashboard)/frequencia` | Server | getCurrentUser() + grupo | Frequência/presença |
| `/(dashboard)/jogos` | Server | getCurrentUser() + grupo | Jogos e resultados |
| `/(dashboard)/modalidades` | Client | GroupContext | Modalidades esportivas |
| `/(dashboard)/modalidades/[id]` | Server | getCurrentUser() | Detalhe da modalidade |
| `/(dashboard)/rankings` | Server | getCurrentUser() + grupo | Rankings de jogadores |
| `/(dashboard)/treinos` | Server | getCurrentUser() + grupo | Treinos recorrentes |
| `/(dashboard)/financeiro` | Server | getCurrentUser() + grupo | Dashboard financeiro |
| `/(dashboard)/financeiro/charges/[chargeId]` | Server | Admin | Detalhe de cobrança |

## API Routes (route.ts)

### Autenticação
| Método | Rota | Auth | Propósito |
|--------|------|------|-----------|
| POST | /api/auth/signup | Pública | Cadastro com bcrypt |
| GET/POST | /api/auth/[...nextauth] | NextAuth | Handlers NextAuth |
| GET | /api/debug | Pública | Healthcheck/debug |

### Atletas & Modalidades
| Método | Rota | Auth | Propósito |
|--------|------|------|-----------|
| GET | /api/athletes/[userId]/modalities | Auth | Listar modalidades do atleta |
| POST | /api/athletes/[userId]/modalities | Auth | Adicionar modalidade |
| PATCH | /api/athletes/[userId]/modalities/[modalityId] | Auth | Atualizar nota/posição |
| DELETE | /api/athletes/[userId]/modalities/[modalityId] | Auth | Remover modalidade |
| GET | /api/modalities?group_id= | Auth+Membro | Listar modalidades do grupo |
| POST | /api/modalities | Auth+Admin | Criar modalidade |
| GET | /api/modalities/[id] | Auth+Membro | Detalhe da modalidade |
| PATCH | /api/modalities/[id] | Auth+Admin | Editar modalidade |
| DELETE | /api/modalities/[id] | Auth+Admin | Remover modalidade |
| GET | /api/modalities/[id]/positions | Auth+Membro | Listar posições |
| POST | /api/modalities/[id]/positions | Auth+Admin | Configurar posições |

### Eventos
| Método | Rota | Auth | Propósito |
|--------|------|------|-----------|
| GET | /api/events?groupId= | Auth+Membro | Listar eventos |
| POST | /api/events | Auth+Admin | Criar evento |
| GET | /api/events/[eventId] | Auth+Membro | Detalhe do evento |
| PATCH | /api/events/[eventId] | Auth+Admin | Editar evento |
| DELETE | /api/events/[eventId] | Auth+Admin | Cancelar evento |
| POST | /api/events/[eventId]/rsvp | Auth+Membro | Confirmar/declinar presença |
| POST | /api/events/[eventId]/admin-rsvp | Auth+Admin | Admin confirma jogador |
| GET | /api/events/[eventId]/actions | Auth+Membro | Listar ações do jogo |
| POST | /api/events/[eventId]/actions | Auth+Admin | Registrar ação (gol, assist) |
| DELETE | /api/events/[eventId]/actions | Auth+Admin | Remover ação |
| POST | /api/events/[eventId]/draw | Auth+Admin | Sortear times |
| GET | /api/events/[eventId]/teams | Auth+Membro | Listar times |
| POST | /api/events/[eventId]/teams | Auth+Admin | Criar times manualmente |
| POST | /api/events/[eventId]/teams/swap | Auth+Admin | Trocar jogadores entre times |
| GET | /api/events/[eventId]/ratings | Auth+Membro | Ver voto MVP |
| POST | /api/events/[eventId]/ratings | Auth+Participante | Votar MVP |
| POST | /api/events/[eventId]/ratings/finalize | Auth+Admin | Finalizar votação MVP |
| GET | /api/events/[eventId]/ratings/tiebreaker | Auth+Membro | Info do desempate |
| POST | /api/events/[eventId]/ratings/tiebreaker/vote | Auth+Participante | Votar desempate |
| POST | /api/events/[eventId]/ratings/tiebreaker/decide | Auth+Admin | Admin decide desempate |

### Grupos
| Método | Rota | Auth | Propósito |
|--------|------|------|-----------|
| GET | /api/groups | Auth | Listar grupos do usuário |
| POST | /api/groups | Auth | Criar grupo |
| GET | /api/groups/managed | Auth | Grupos que admin |
| POST | /api/groups/switch | Auth+Membro | Trocar grupo ativo |
| POST | /api/groups/join | Auth | Entrar com código |
| GET | /api/groups/[groupId] | Auth+Membro | Detalhe do grupo |
| PATCH | /api/groups/[groupId] | Auth+Admin | Editar grupo |
| GET | /api/groups/[groupId]/invites | Auth+Admin | Listar convites |
| POST | /api/groups/[groupId]/invites | Auth+Admin | Criar convite |
| DELETE | /api/groups/[groupId]/invites/[inviteId] | Auth+Admin | Revogar convite |
| POST | /api/groups/[groupId]/members | Auth+Admin | Adicionar membro |
| PATCH | /api/groups/[groupId]/members/[userId] | Auth+Admin | Alterar role do membro |
| DELETE | /api/groups/[groupId]/members/[userId] | Auth+Admin | Remover membro |
| POST | /api/groups/[groupId]/members/create-user | Auth+Admin | Criar usuário e adicionar |
| GET | /api/groups/[groupId]/charges | Auth+Membro | Listar cobranças |
| POST | /api/groups/[groupId]/charges | Auth+Admin | Criar cobrança |
| PATCH | /api/groups/[groupId]/charges/[chargeId] | Auth+Admin | Atualizar status |
| DELETE | /api/groups/[groupId]/charges/[chargeId] | Auth+Admin | Remover cobrança |
| GET | /api/groups/[groupId]/draw-config | Auth+Membro | Config de sorteio |
| POST | /api/groups/[groupId]/draw-config | Auth+Admin | Salvar config sorteio |
| GET | /api/groups/[groupId]/event-settings | Auth+Membro | Config de eventos |
| POST | /api/groups/[groupId]/event-settings | Auth+Admin | Salvar config eventos |
| GET | /api/groups/[groupId]/rankings | Auth+Membro | Rankings do grupo |
| GET | /api/groups/[groupId]/my-stats | Auth+Membro | Estatísticas do usuário |
| GET | /api/groups/[groupId]/stats | Auth+Membro | Estatísticas do grupo |
| GET | /api/groups/[groupId]/receiver-profiles | Auth+Membro | Perfis PIX |
| POST | /api/groups/[groupId]/receiver-profiles | Auth+Admin | Criar perfil PIX |

### Financeiro & Créditos
| Método | Rota | Auth | Propósito |
|--------|------|------|-----------|
| GET | /api/charges/[chargeId]/pix | Auth | Obter QR Code PIX |
| POST | /api/charges/[chargeId]/pix | Auth | Gerar QR Code PIX |
| GET | /api/credits?group_id= | Auth+Membro | Saldo e pacotes |
| POST | /api/credits | Auth+Admin | Comprar créditos |
| POST | /api/credits/check | Auth+Membro | Verificar saldo |
| GET | /api/credits/history | Auth+Membro | Histórico de transações |
| POST | /api/credits/validate-coupon | Auth+Membro | Validar cupom |

### Notificações & Outros
| Método | Rota | Auth | Propósito |
|--------|------|------|-----------|
| GET | /api/notifications | Auth | Listar notificações |
| POST | /api/notifications?action=mark-all-read | Auth | Marcar todas como lidas |
| PATCH | /api/notifications/[id] | Auth+Própria | Marcar como lida |
| DELETE | /api/notifications/[id] | Auth+Própria | Deletar notificação |
| GET | /api/recurring-trainings?group_id= | Auth+Membro | Treinos recorrentes |
| POST | /api/recurring-trainings | Auth+Admin+5créditos | Criar treino recorrente |
| GET | /api/search?q=&group_id= | Auth+Membro | Busca global |
| GET | /api/users/me/pending-charges-count | Auth | Cobranças pendentes |
| GET | /api/users/search?q= | Auth | Buscar usuários |
