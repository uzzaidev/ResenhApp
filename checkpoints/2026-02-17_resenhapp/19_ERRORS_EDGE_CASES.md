# ResenhApp V2.0 — Erros e Edge Cases
> FATO (do código) — src/lib/error-handler.ts, padrões nas API routes

## Códigos de Status HTTP Padrão
| Código | Quando | Exemplo |
|--------|--------|---------|
| 200 | Sucesso GET/PATCH | Dados retornados |
| 201 | Sucesso criação | Grupo/evento criado |
| 400 | Validação falhou | Zod error, campo inválido |
| 401 | Sem autenticação | Session expirada |
| 402 | Créditos insuficientes | Feature requer créditos |
| 403 | Sem permissão | Não é admin do grupo |
| 404 | Recurso não encontrado | Evento/grupo inexistente |
| 409 | Conflito | Email duplicado no signup |
| 429 | Rate limit | 5+ tentativas de login/min |
| 500 | Erro interno | Falha de banco de dados |

## Edge Cases Documentados

### RSVP (Confirmação de Presença)
| Situação | Comportamento |
|----------|--------------|
| Evento lotado (max_players atingido) | Vai para waitlist se allow_waitlist=true |
| Remove RSVP da lista principal | Promove primeiro da waitlist automaticamente |
| RSVP com autoChargeOnRsvp=true e price>0 | Cria cobrança e gera PIX automaticamente |
| RSVP para evento já passado | INFERÊNCIA: Não bloqueado explicitamente |
| Votar em si mesmo (MVP) | Bloqueado: CHECK voter_id != voted_for_id |

### Grupos
| Situação | Comportamento |
|----------|--------------|
| Último admin tenta se rebaixar | Bloqueado: "Cannot demote last admin" |
| Admin tenta se remover do grupo | Bloqueado: "Cannot remove self" |
| Criar grupo filho de pelada | Bloqueado por validateHierarchy() |
| Código de convite expirado | 400: Invite expired |
| Código de convite com max_uses atingido | 400: Max uses reached |
| Já é membro do grupo | 400: Already a member |

### PIX
| Situação | Comportamento |
|----------|--------------|
| PIX já foi gerado | Retorna cached (não gera novamente) |
| Receiver profile não configurado | Erro descritivo retornado |
| Chave PIX inválida | validatePixKey retorna false |

### Créditos
| Situação | Comportamento |
|----------|--------------|
| Créditos insuficientes | 402 Payment Required |
| Cupom já usado pelo grupo | UNIQUE(coupon_id, group_id) bloqueia |
| Cupom expirado | validateCoupon retorna error |

### MVP/Ratings
| Situação | Comportamento |
|----------|--------------|
| Empate na votação MVP | Cria mvp_tiebreaker, notifica |
| Todos votam no tiebreaker | Auto-resolve |
| Admin decide tiebreaker manualmente | POST .../tiebreaker/decide |
