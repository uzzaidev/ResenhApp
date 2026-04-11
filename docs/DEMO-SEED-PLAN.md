# Plano de Dados Demo — ResenhApp

> Documento de planejamento para criação dos SQLs de seed de demonstração.
> **Criar os SQLs apenas após aprovação deste plano.**
> Data: 2026-03-25

---

## 1. Objetivo

Criar um conjunto de scripts SQL que popule o banco com dados realistas e interconectados, permitindo demonstrar **a jornada completa do usuário** no ResenhApp — do cadastro ao histórico de partidas.

Ao final da execução dos scripts, qualquer pessoa poderá:
- Fazer login como admin ou jogador
- Ver dashboard com métricas reais
- Navegar por grupos com histórico de partidas
- Ver cobranças, pagamentos PIX e créditos
- Ver rankings e conquistas com dados reais
- Ver o feed social com posts e reações

---

## 2. Cenário Narrativo ("Resenha FC")

> **Resenha FC** é uma pelada de bairro organizada pelo Pedro (dono/admin).
> O grupo tem 7 membros ativos, joga toda terça e quinta à noite num campo society.
> Já tem 6 semanas de história: 10 jogos realizados, cobranças registradas, rankings formados.

**Grupo secundário:** também existe a **Atlética Demo** — uma atlética com um grupo filho de **Futebol Society**, para demonstrar a hierarquia multi-tenant.

---

## 3. Personagens (Usuários)

| # | Nome | Email | Papel | Posição | Notas |
|---|------|-------|-------|---------|-------|
| 1 | **Pedro Alves** | `pedro@demo.resenhapp.com` | Owner / Admin | Meia | Conta principal para login de admin |
| 2 | **João Silva** | `joao@demo.resenhapp.com` | Membro | Atacante | Artilheiro do grupo |
| 3 | **Carlos Souza** | `carlos@demo.resenhapp.com` | Membro | Zagueiro | Goleiro reserva |
| 4 | **Maria Lima** | `maria@demo.resenhapp.com` | Membro | Meia-atacante | Única mulher — mostra inclusão |
| 5 | **Roberto Costa** | `roberto@demo.resenhapp.com` | Membro | Goleiro | Goleiro titular |
| 6 | **Lucas Ferreira** | `lucas@demo.resenhapp.com` | Membro | Lateral direito | Defensor consistente |
| 7 | **Ana Santos** | `ana@demo.resenhapp.com` | Membro | Ponta esquerda | Mais assistências |

**Senha de todos:** `Demo@1234`
**Hash bcrypt pré-gerado** (cost 10): será inserido diretamente no campo `password_hash`

---

## 4. Estrutura de Grupos

```
PLATAFORMA
│
├── [Grupo 1] Resenha FC (standalone / pelada)
│   ├── Tipo: 'pelada'
│   ├── Modalidade: futebol / society
│   ├── Owner: Pedro Alves
│   ├── Code: RESENHA01
│   └── 7 membros (Pedro=owner, João+Carlos+Maria+Roberto+Lucas+Ana=member)
│
└── [Grupo 2] Atlética Demo (athletic / parent)
    ├── Tipo: 'athletic'
    ├── Owner: Pedro Alves
    ├── Code: ATLETICA01
    └── [Grupo 3] Futebol Society - Terça (pelada / child)
        ├── Tipo: 'pelada'
        ├── parent_group_id: Atlética Demo
        ├── Owner: João Silva (demonstra delegação)
        ├── Code: SOCIETY01
        └── 5 membros (João=owner, Carlos+Maria+Lucas+Ana=member)
```

---

## 5. Sport Modalities (modalidades do grupo)

Para o grupo **Resenha FC**, cadastrar 2 modalidades para o Pedro:

| Nome | Tipo | Descrição |
|------|------|-----------|
| Futebol Society | society | Campo society coberto, bola 5 |
| Futsal | futsal | Quadra poliesportiva, bola 4 |

---

## 6. Venue (Local)

| Nome | Endereço | Cidade | Superfície |
|------|----------|--------|-----------|
| Arena Society SP | Rua das Palmeiras, 42 | São Paulo | grama_sintetica |

---

## 7. Cronologia de Eventos

### Grupo: Resenha FC (10 eventos no total)

#### Eventos CONCLUÍDOS (8 eventos — últimas 6 semanas)

| # | Título | Data | Tipo | Jogadores | Placar | Status |
|---|--------|------|------|-----------|--------|--------|
| E1 | Pelada #1 - Resenha FC | 2026-02-03 (ter) | official_game | 6 | Time A 3x2 Time B | completed |
| E2 | Treino Técnico #1 | 2026-02-05 (qui) | training | 5 | — | completed |
| E3 | Pelada #2 - Resenha FC | 2026-02-10 (ter) | official_game | 7 | Time A 2x2 Time B | completed |
| E4 | Treino Técnico #2 | 2026-02-12 (qui) | training | 6 | — | completed |
| E5 | Pelada #3 - Resenha FC | 2026-02-17 (ter) | official_game | 7 | Time A 4x1 Time B | completed |
| E6 | Treino Físico | 2026-02-19 (qui) | training | 5 | — | completed |
| E7 | Pelada #4 - Resenha FC | 2026-02-24 (ter) | official_game | 7 | Time A 2x3 Time B | completed |
| E8 | Pelada #5 - Resenha FC | 2026-03-03 (ter) | official_game | 7 | Time A 1x1 Time B | completed |

#### Eventos FUTUROS (2 eventos — próximas semanas)

| # | Título | Data | Tipo | Status |
|---|--------|------|------|--------|
| E9 | Pelada #6 - Resenha FC | 2026-04-01 (ter) | official_game | scheduled |
| E10 | Treino Integração | 2026-04-03 (qui) | training | scheduled |

> E9 terá RSVPs confirmados mas SEM times sorteados — mostra o estado "pré-sorteio"
> E10 terá RSVPs parciais — mostra lista de espera

---

## 8. Detalhamento das Partidas (Eventos Oficiais)

### Partida E1 (2026-02-03)

**Times:**
- Time A (Azul): Pedro, João, Carlos, Roberto(GK)
- Time B (Vermelho): Maria, Lucas, Ana

**Ações:**
| Min | Tipo | Jogador | Assistência |
|-----|------|---------|-------------|
| 8 | goal | João | Pedro |
| 15 | goal | Maria | — |
| 22 | goal | João | Ana |
| 31 | yellow_card | Carlos | — |
| 35 | goal | Lucas | Maria |
| 40 | goal | Pedro | — |

**Placar final:** Time A 3 × 2 Time B
**MVP:** João (2 gols + 1 assistência)

---

### Partida E3 (2026-02-10)

**Times:**
- Time A (Verde): Pedro, Maria, Lucas, Roberto(GK)
- Time B (Laranja): João, Carlos, Ana

**Ações:**
| Min | Tipo | Jogador | Assistência |
|-----|------|---------|-------------|
| 10 | goal | Ana | João |
| 18 | goal | Pedro | Maria |
| 25 | goal | João | — |
| 38 | goal | Lucas | Pedro |

**Placar final:** Time A 2 × 2 Time B
**MVP:** Ana (1 gol + 1 assist)

---

### Partida E5 (2026-02-17)

**Times:**
- Time A (Preto): Pedro, João, Ana, Roberto(GK)
- Time B (Branco): Maria, Carlos, Lucas

**Ações:**
| Min | Tipo | Jogador | Assistência |
|-----|------|---------|-------------|
| 5 | goal | João | Ana |
| 12 | goal | João | Pedro |
| 20 | goal | Ana | — |
| 28 | yellow_card | Carlos | — |
| 32 | goal | João | Ana |
| 38 | own_goal | Lucas | — |

**Placar final:** Time A 4 × 1 Time B
**MVP:** João (hat-trick)

---

### Partida E7 (2026-02-24)

**Times:**
- Time A (Azul): Pedro, Maria, Carlos, Roberto(GK)
- Time B (Vermelho): João, Lucas, Ana

**Ações:**
| Min | Tipo | Jogador | Assistência |
|-----|------|---------|-------------|
| 7 | goal | João | Lucas |
| 15 | goal | Pedro | Maria |
| 22 | goal | Lucas | — |
| 30 | red_card | Carlos | — |
| 35 | goal | Ana | João |
| 38 | goal | Maria | Pedro |

**Placar final:** Time A 2 × 3 Time B
**MVP:** João (1 gol + 1 assist)

---

### Partida E8 (2026-03-03)

**Times:**
- Time A (Verde): João, Carlos, Ana, Roberto(GK)
- Time B (Laranja): Pedro, Maria, Lucas

**Ações:**
| Min | Tipo | Jogador | Assistência |
|-----|------|---------|-------------|
| 12 | goal | Maria | Pedro |
| 25 | goal | Ana | João |
| 30 | save | Roberto | — |
| 38 | save | Roberto | — |

**Placar final:** Time A 1 × 1 Time B
**MVP:** Roberto (2 defesas no empate)

---

## 9. Estatísticas Consolidadas (player_stats)

> Serão calculadas a partir das partidas acima. Valores esperados após os 5 jogos oficiais:

| Jogador | Jogos | Gols | Assists | Cartões | Médias |
|---------|-------|------|---------|---------|--------|
| João | 8 | 7 | 2 | 0 | nota ≈ 8.5 |
| Pedro | 8 | 3 | 3 | 0 | nota ≈ 7.8 |
| Ana | 8 | 3 | 4 | 0 | nota ≈ 8.0 |
| Maria | 8 | 3 | 2 | 0 | nota ≈ 7.5 |
| Lucas | 8 | 2 | 1 | 0 | nota ≈ 7.2 |
| Roberto | 8 | 0 | 0 | 0 | nota ≈ 7.8 (goleiro) |
| Carlos | 8 | 0 | 0 | 2 | nota ≈ 6.8 |

---

## 10. Sistema Financeiro

### Receiver Profile (chave PIX do admin)
```
holder_name: Pedro Alves
pix_key_type: cpf
pix_key: 123.456.789-00
user_id: pedro
```

### Cobranças por Evento (R$20 por jogador)

| Evento | Jogadores cobrados | Status |
|--------|--------------------|--------|
| E5 (Pelada #3) | 7 jogadores | João=paid, Carlos=paid, 3=self_reported, 2=pending |
| E7 (Pelada #4) | 7 jogadores | todos=paid (evento passado pago) |
| E8 (Pelada #3) | 7 jogadores | João=paid, 2=self_reported, 4=pending |
| E9 (Próxima) | RSVPs confirmados | todos=pending (evento futuro) |

### Carteira do Grupo (wallets)
```
balance: 280.00 (R$280 = 14 cobranças pagas × R$20)
total_received: 280.00
```

### Créditos do Grupo (groups.credits_balance)
```
Resenha FC: 450 créditos
- 500 créditos iniciais de boas-vindas
- -5 por criar treino recorrente
- -5 por criar treino recorrente
- +outros ganhos
```

### Credit Transactions (histórico)
| Tipo | Valor | Descrição |
|------|-------|-----------|
| purchase | +500 | Pacote inicial de boas-vindas |
| consumption | -5 | Treino recorrente criado |
| consumption | -5 | Treino recorrente criado |
| consumption | -2 | QR Code check-in |
| purchase | +50 | Cupom DEMO2024 aplicado |

---

## 11. Gamificação

### Achievement Types a criar
| Código | Nome | Categoria | Pontos | Critério |
|--------|------|-----------|--------|---------|
| FIRST_GOAL | Primeiro Gol | goals | 50 | goals >= 1 |
| HAT_TRICK | Hat-Trick | goals | 200 | 3+ gols numa partida |
| TOP_SCORER | Artilheiro | goals | 150 | mais gols no grupo |
| REGULAR_PLAYER | Frequência Regular | participation | 100 | 5+ eventos |
| DECUPLE | 10 Jogos | participation | 200 | 10+ eventos |
| GOALKEEPER_HERO | Herói do Gol | special | 150 | goleiro com 2+ saves |
| FIRST_MVP | Primeiro MVP | special | 100 | primeiro MVP recebido |

### User Achievements (desbloqueados)
| Usuário | Achievement | Evento |
|---------|-------------|--------|
| João | FIRST_GOAL | E1 |
| João | HAT_TRICK | E5 |
| João | FIRST_MVP | E1 |
| Pedro | FIRST_GOAL | E1 |
| Ana | FIRST_GOAL | E3 |
| Roberto | GOALKEEPER_HERO | E8 |
| Todos | REGULAR_PLAYER | (após 5+ jogos) |

### Leaderboard (all_time — gerado manualmente)
Categoria: goals — ranking gerado para demonstração

---

## 12. Social Posts (depende das migrations Phase 4)

> Atenção: só inserir se a migration `20260301000014_phase4_social_core.sql` estiver aplicada.
> O script verificará a existência da tabela `social_posts` antes de inserir.

| Autor | Tipo | Conteúdo | Reações | Comentários |
|-------|------|----------|---------|-------------|
| João | training_photo | "Que golaço hoje! 🔥 Hat-trick na pelada do Resenha!" | 5 likes | 3 comentários |
| Maria | text_update | "Empate, mas que jogo emocionante. Próxima a gente busca a vitória!" | 3 likes | 2 comentários |
| Pedro | match_result | "Resultado da pelada de hoje: Azul 3x2 Vermelho. Obrigado galera!" | 6 likes | 1 comentário |
| Ana | training_photo | "Treino técnico pesado hoje. Melhorando cada vez mais ⚽" | 4 likes | 2 comentários |

---

## 13. Notificações Demo

| Destinatário | Tipo | Título | Corpo |
|-------------|------|--------|-------|
| João | achievement_unlocked | "Conquista desbloqueada! 🏆" | "Você desbloqueou: Hat-Trick! 3 gols em uma partida." |
| Pedro | payment_received | "Pagamento confirmado" | "João Silva confirmou pagamento de R$20,00 para a Pelada #5." |
| Ana | event_created | "Nova pelada criada!" | "Pedro criou a Pelada #6 para 01/04. Confirme sua presença!" |
| Carlos | rsvp_confirmed | "Presença confirmada" | "Sua presença na Pelada #6 foi confirmada." |
| Roberto | team_drawn | "Times sorteados!" | "Os times para a Pelada #3 foram sorteados. Você está no Time A!" |

---

## 14. Arquivos SQL a Criar

Os scripts serão criados em `supabase/demo/` (pasta nova, não interfere com migrations):

| Arquivo | Conteúdo | Dependências |
|---------|----------|-------------|
| `00_demo_cleanup.sql` | DROP / TRUNCATE para rollback completo | nenhuma |
| `01_demo_users.sql` | users + profiles (7 usuários) | nenhuma |
| `02_demo_groups.sql` | groups + group_members + venues + invites | 01 |
| `03_demo_modalities.sql` | sport_modalities (modalidades do Pedro) | 01, 02 |
| `04_demo_events.sql` | events (10 eventos) + event_attendance + receiver_profiles | 01, 02, 03 |
| `05_demo_partidas.sql` | teams + team_members + event_actions + votes + player_stats + event_stats | 01, 02, 04 |
| `06_demo_financeiro.sql` | charges + charge_splits + wallets + transactions + credit_transactions | 01, 02, 04 |
| `07_demo_gamification.sql` | achievement_types + user_achievements + leaderboards | 01, 02, 04, 05 |
| `08_demo_notifications.sql` | notifications | 01, 02, 04 |
| `09_demo_social.sql` | social_posts + reactions + comments (com guard IF EXISTS) | 01, 02, 04 |

**Script master:** `supabase/demo/RUN_ALL_DEMO.sql` — executa na ordem correta

---

## 15. Estratégia Técnica dos SQLs

### UUIDs Fixos
Para os usuários (que usam UUIDs), usaremos UUIDs fixos hard-coded para que sejam referenciáveis entre scripts:

```sql
-- Pedro
'a0000000-0000-0000-0000-000000000001'

-- João
'a0000000-0000-0000-0000-000000000002'

-- Carlos
'a0000000-0000-0000-0000-000000000003'

-- Maria
'a0000000-0000-0000-0000-000000000004'

-- Roberto
'a0000000-0000-0000-0000-000000000005'

-- Lucas
'a0000000-0000-0000-0000-000000000006'

-- Ana
'a0000000-0000-0000-0000-000000000007'
```

### IDs Sequenciais (BIGSERIAL)
Para grupos, eventos, etc. — usamos `DO $$ DECLARE $$ END` com variáveis locais ou CTEs com RETURNING para capturar os IDs gerados.

Alternativamente, resetamos sequences antes de inserir e usamos valores fixos conhecidos — mais simples para seed.

### Abordagem escolhida: CTE com RETURNING
```sql
WITH inserted_group AS (
  INSERT INTO groups (...) RETURNING id
)
INSERT INTO group_members (group_id, user_id, ...)
SELECT id, '...uuid...', 'owner' FROM inserted_group;
```

### Senha Hash
Todos usam `Demo@1234`. Hash bcrypt (cost 10) para inserir diretamente:
```
$2b$10$YourHashHere
```
> Hash será gerado antes de criar os SQLs. Um script Node.js simples para isso.

### Guard para tabelas condicionais (Social)
```sql
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_posts') THEN
    -- inserir social posts
  END IF;
END $$;
```

---

## 16. Como Aplicar

```bash
# Via psql direto (recomendado para demo local)
psql "$DATABASE_URL" -f supabase/demo/RUN_ALL_DEMO.sql

# Ou arquivo por arquivo, em ordem:
psql "$DATABASE_URL" -f supabase/demo/01_demo_users.sql
psql "$DATABASE_URL" -f supabase/demo/02_demo_groups.sql
# ... etc
```

> **Importante:** Executar APÓS todas as migrations (incluindo as pendentes).
> Se as migrations Phase 4 não estiverem aplicadas, o script `09_demo_social.sql` será ignorado automaticamente.

---

## 17. Como Desfazer (Rollback)

```bash
psql "$DATABASE_URL" -f supabase/demo/00_demo_cleanup.sql
```

O cleanup remove todos os dados com `WHERE email LIKE '%@demo.resenhapp.com'` (nunca apaga dados reais).

---

## 18. Jornada de Demonstração Sugerida

### Login como Admin (Pedro)
1. Login: `pedro@demo.resenhapp.com` / `Demo@1234`
2. **Dashboard** → ver métricas: 10 eventos, 7 membros, R$280 recebidos
3. **Grupos** → ver Resenha FC + Atlética Demo (hierarquia)
4. **Eventos** → ver histórico de 8 eventos + 2 futuros
5. **Partida E5** → ver placar, times, ações, hat-trick do João, MVP
6. **Financeiro** → ver cobranças: pagas, auto-declaradas, pendentes
7. **Rankings** → ver artilheiros (João #1), frequência, médias
8. **Créditos do grupo** → ver saldo 450 + histórico de transações
9. **Notificações** → ver todas as notificações demo

### Login como Jogador (João)
1. Login: `joao@demo.resenhapp.com` / `Demo@1234`
2. **Dashboard** → ver próxima pelada (E9), saldo créditos pessoais
3. **Perfil** → ver stats: 7 gols, artilheiro do grupo
4. **Conquistas** → ver FIRST_GOAL + HAT_TRICK + FIRST_MVP desbloqueados
5. **Feed Social** → ver posts, curtir, comentar
6. **Minha carteira** → ver créditos pessoais e histórico

---

## 19. Riscos e Cuidados

| Risco | Mitigação |
|-------|-----------|
| Hash bcrypt precisa ser gerado corretamente | Gerar via script Node antes de criar SQL |
| BIGSERIAL IDs podem colidir com dados existentes | Cleanup script limpa por UUID fixo, não por ID |
| Tabelas das migrations pendentes podem não existir | Guards `IF EXISTS` em cada script condicional |
| Triggers podem disparar side effects | Desabilitar temporariamente se causar problema |
| RLS policies podem bloquear INSERT direto | Inserir como superuser (conexão direta, não via app) |
| Unique constraints (email, group code) | Cleanup script deve rodar primeiro sempre |

---

## 20. Próximos Passos

- [ ] Aprovação deste plano
- [ ] Gerar hash bcrypt para `Demo@1234`
- [ ] Criar `supabase/demo/` e todos os 10 arquivos SQL
- [ ] Testar execução em banco de desenvolvimento
- [ ] Validar jornada completa de demonstração
