# ResenhApp V2.0 — Fluxos Principais
> FATO (do código) — fluxogramas dos processos críticos

## Fluxo 1: Criação e Execução de Pelada

```mermaid
flowchart TD
    A[Admin cria Evento\n/api/events POST] --> B{Tem preço?}
    B -- Sim --> C[Define receiver_profile\ne autoChargeOnRsvp]
    B -- Não --> D[Evento sem cobrança]
    C --> E[Evento criado]
    D --> E
    E --> F[Jogadores confirmam\n/api/events/:id/rsvp POST]
    F --> G{Tem vaga?}
    G -- Sim --> H[Status: yes\nevent_attendance INSERT]
    G -- Não --> I[Status: waitlist]
    H --> J{autoChargeOnRsvp?}
    J -- Sim --> K[Cria charge\nGera PIX QR Code]
    J -- Não --> L[Sem cobrança automática]
    K --> M[Jogador paga via PIX]
    L --> M2[Admin marca como pago]
    M --> N[Admin sorteia times\n/api/events/:id/draw POST]
    M2 --> N
    N --> O[Times criados\nevents_teams INSERT]
    O --> P[Partida acontece\nAdmin registra ações\n/api/events/:id/actions POST]
    P --> Q[Gols, assistências\nyellow_card, red_card]
    Q --> R[Admin finaliza MVP\n/api/events/:id/ratings/finalize]
    R --> S{Empate?}
    S -- Sim --> T[Tiebreaker criado\njogadores votam]
    S -- Não --> U[MVP definido]
    T --> U
    U --> V[Estatísticas atualizadas\nTriggers: player_stats]
```

## Fluxo 2: Autenticação

```mermaid
flowchart TD
    A[Usuário acessa app] --> B{Tem sessão?}
    B -- Sim --> C[Dashboard]
    B -- Não --> D[Landing page /]
    D --> E[Clica Entrar]
    E --> F[/auth/signin]
    F --> G[Preenche email+senha]
    G --> H[POST signIn credentials]
    H --> I[NextAuth Credentials Provider]
    I --> J[SELECT users WHERE email]
    J --> K{Usuário existe?}
    K -- Não --> L[Erro: credenciais inválidas]
    K -- Sim --> M[bcrypt.compare senha]
    M --> N{Senha correta?}
    N -- Não --> L
    N -- Sim --> O[Cria JWT token]
    O --> P[Set-Cookie HTTP-only]
    P --> Q[Redirect /dashboard]
    Q --> R{Tem grupos?}
    R -- Não --> S[Tela criar/entrar grupo]
    R -- Sim --> T[Carrega GroupContext]
    T --> U[Dashboard com grupo ativo]
```

## Fluxo 3: Sistema PIX

```mermaid
flowchart TD
    A[Admin configura\nreceiver_profile\n/api/groups/:id/receiver-profiles] --> B[Cria evento com preço]
    B --> C[Jogador confirma RSVP]
    C --> D[API cria charge\nno banco]
    D --> E[Chama generatePixForCharge]
    E --> F{PIX já gerado?}
    F -- Sim --> G[Retorna cached]
    F -- Não --> H[Busca receiver_profile\nda cobrança]
    H --> I{Profile configurado?}
    I -- Não --> J[Erro: receiver not configured]
    I -- Sim --> K[generatePixQRCode\nsrc/lib/pix.ts]
    K --> L[Monta payload EMV BR Code]
    L --> M[calculateCRC16]
    M --> N[generatePixQRImage\nqrcode library]
    N --> O[UPDATE charges\npix_payload e qr_image_url]
    O --> P[Retorna QR para frontend]
    P --> Q[Exibe QR Code\npix-payment-card.tsx]
```

## Fluxo 4: Sistema de Créditos

```mermaid
flowchart TD
    A[Admin quer criar\nTreino Recorrente] --> B[POST /api/recurring-trainings]
    B --> C[withCreditsCheck middleware]
    C --> D[hasEnoughCredits\ngroupId, 'recurring_training']
    D --> E{Tem 5+ créditos?}
    E -- Não --> F[402 Payment Required]
    E -- Sim --> G[Executa handler]
    G --> H[Cria treinos recorrentes]
    H --> I[checkAndConsumeCredits\natomic SQL function]
    I --> J[INSERT credit_transactions\n-5 créditos]
    J --> K[UPDATE groups\ncredits_balance -= 5]
    K --> L[Retorna sucesso]

    M[Admin compra créditos\nPOST /api/credits] --> N[purchaseCredits]
    N --> O{Tem cupom?}
    O -- Sim --> P[validateCoupon\naplicar desconto]
    O -- Não --> Q[Preço cheio]
    P --> R[applyCoupon\nINSERT coupon_usages]
    Q --> S[add_credits SQL function]
    R --> S
    S --> T[INSERT credit_transactions\n+créditos]
    T --> U[UPDATE groups\ncredits_balance += X]
```
