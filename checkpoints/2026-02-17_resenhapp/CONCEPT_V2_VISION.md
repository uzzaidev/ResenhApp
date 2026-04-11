# ResenhApp V2.0 — Visão Conceitual Revisada
> Documento gerado em 2026-02-17 | Fonte: briefing do fundador + análise do sistema atual

---

## 1. O Que o App É (Definição Clara)

**ResenhApp** é uma rede social esportiva com sistema de gestão de grupos de treino e jogos, monetizada por uma economia interna de créditos.

É simultaneamente:
- Uma **plataforma de gestão** (organizar treinos, peladas, times, presenças, cobranças)
- Uma **rede social esportiva** (fotos, curtidas, comentários, conquistas, rankings)
- Um **marketplace interno** (créditos comprados, ganhos e gastos para desbloquear funcionalidades)

---

## 2. Hierarquia de Entidades

```
PLATAFORMA (ResenhApp)
│
├── ATLÉTICA (Tenant/Multi-tenant)
│   ├── É a unidade de negócio máxima
│   ├── Gerencia várias modalidades/grupos
│   ├── Pode delegar gestão de cada grupo a um admin específico
│   └── Requer X créditos para ser criada
│
├── GRUPO DE MODALIDADE (dentro ou fora de uma atlética)
│   ├── Pode pertencer a uma atlética (fica sob sua gestão)
│   ├── Pode ser INDEPENDENTE (sem atlética) — o famoso "admin de pelada"
│   ├── Tem 1 admin principal (owner)
│   ├── O owner pode ser diferente de qualquer membro da atlética
│   └── Requer Y créditos para ser criado/administrado
│
└── PARTICIPANTE
    ├── Membro de um ou mais grupos
    ├── Possui carteira de créditos
    └── Participa da rede social
```

### 2.1 Tipos de Grupo

| Tipo | Com Atlética | Sem Atlética |
|------|-------------|--------------|
| Futebol society | Grupo de futebol da Atlética XYZ | Pelada do João (independente) |
| Vôlei | Grupo de vôlei da Atlética XYZ | Grupo de vôlei da praia |
| Futsal | Grupo de futsal da Atlética XYZ | Racha de futsal |
| Qualquer esporte | Gerenciado pela atlética | Gerenciado pelo owner direto |

### 2.2 Delegação de Admin

```
Atlética Paulistana
├── Cria grupo: "Futebol Society - Segunda"
│   └── Delega admin para: João (que NÃO é da atlética)
│       └── João gerencia: local, horário, vagas, valor do treino
│
├── Cria grupo: "Vôlei Feminino - Quarta"
│   └── Admin: Maria (membro da atlética)
│
└── Cria grupo: "Futsal - Sábado"
    └── Admin: Carlos (diretor da atlética = admin natural)
```

---

## 3. Sistema de Pagamentos (Simplificado)

### Fluxo Atual (problemático)
```
Admin configura PIX → Sistema gera QR Code dinâmico (BR Code EMV) →
Participante paga → Admin confirma manualmente
```
O QR Code dinâmico é complexo e desnecessário para o estágio atual.

### Fluxo Revisado (proposto)
```
Admin cadastra sua CHAVE PIX estática (CPF/CNPJ/telefone/email/aleatória)
↓
Sistema exibe a chave PIX para o participante copiar/escanear
↓
Participante realiza o pagamento no próprio app bancário
↓
Participante marca "Eu paguei" no ResenhApp
↓
Admin vê na lista de cobranças quem disse que pagou
↓
Admin confirma ou nega o pagamento de cada um
↓
Sistema registra o status (pago/pendente/negado)
```

### Vantagens do Fluxo Simplificado
- Sem necessidade de BR Code EMV — elimina código complexo
- Compatível com qualquer banco/fintech
- Admin tem controle total e responsabilidade clara
- Sem risco de intermediação financeira pela plataforma
- Sem necessidade de integração com gateway

### Campos Necessários no Grupo/Admin
```
receiver_profiles:
  - pix_key_type: cpf | cnpj | email | phone | random
  - pix_key: (a chave em si)
  - name: nome do titular
  - bank_name: (opcional, para referência)
  - instructions: (campo livre — "Coloque seu nome no comentário")
```

---

## 4. Economia de Créditos

### 4.1 Estrutura da Moeda

Os **créditos** são a moeda interna da plataforma. Eles:
- **Custam** para ter acesso a funcionalidades premium
- **São ganhos** através de ações sociais e conquistas
- **Podem ser comprados** diretamente na plataforma
- **Podem ser obtidos** via promoções externas (cupons, parcerias)

### 4.2 Custo por Funcionalidade (proposta de valores)

| Funcionalidade | Créditos | Frequência | Observação |
|---------------|----------|------------|------------|
| **Criar uma Atlética** | 1.000 | Uma vez | Permanente enquanto ativa |
| **Renovar Atlética** | 500 | Mensal/Anual | Manter o benefício |
| **Criar Grupo independente** | 200 | Uma vez | Owner do grupo |
| **Renovar Grupo independente** | 100 | Mensal | Manter ativo |
| **Criar treino recorrente** | 5 | Por criação | Feature existente |
| **Sorteio automático avançado** | 2 | Por sorteio | Balanceamento por rating |
| **Relatórios exportáveis** | 10 | Por export | PDF/CSV de dados |
| **Notificações push ilimitadas** | 50 | Mensal | Após quota gratuita |
| **Grupo com +50 membros** | 100 | Mensal | Escala de tamanho |

> Valores são sugestões iniciais. Ajustar com base em testes de mercado.

### 4.3 Como Ganhar Créditos (Ações Sociais)

| Ação | Créditos Ganhos | Limite Diário | Observação |
|------|----------------|---------------|------------|
| **Postar foto de treino** | +10 | 2 posts/dia | Precisa de aprovação ou filtro de spam |
| **Curtir post de alguém** | +1 | 20 curtidas/dia | Evitar farm de créditos |
| **Comentar em post** | +2 | 10 comentários/dia | Mínimo 10 caracteres |
| **Confirmar presença (RSVP yes)** | +3 | Por evento | Engajamento com eventos |
| **Comparecer ao treino (check-in)** | +5 | Por evento | Confirmado pelo admin |
| **Marcar gol/participar de estatística** | +2 | Por evento | Gerado pelo live score |
| **Completar perfil** | +50 | Uma vez | Onboarding |
| **Convidar amigo que se cadastra** | +30 | Por indicação | Sistema de referral |
| **Receber MVP** | +15 | Por evento | Votação dos pares |
| **Sequência de presença (10 jogos)** | +100 | Por streak | Badge + créditos |
| **Primeiro evento criado** | +20 | Uma vez | Milestone |

### 4.4 Como Comprar Créditos

| Pacote | Créditos | Preço (BRL) | Preço por crédito |
|--------|----------|-------------|-------------------|
| Iniciante | 300 | R$ 9,90 | R$ 0,033 |
| Popular | 1.000 | R$ 24,90 | R$ 0,025 |
| Pro | 3.000 | R$ 59,90 | R$ 0,020 |
| Atleta | 10.000 | R$ 149,90 | R$ 0,015 |

> Pagamento dos pacotes: PIX (irônico, mas eficiente). Pode-se integrar com Stripe ou Mercado Pago futuramente.

---

## 5. Rede Social Esportiva

### 5.1 Feed Social

O app terá um **feed** baseado em contexto:
- **Feed do Grupo**: posts relacionados ao grupo ativo
- **Feed da Atlética**: posts de todos os grupos da atlética
- **Feed Geral**: descoberta de conteúdo público

### 5.2 Tipos de Post

| Tipo | Descrição | Créditos Ganhos |
|------|-----------|----------------|
| `training_photo` | Foto do treino (com grupo vinculado) | +10 |
| `match_result` | Resultado de partida com score | +8 |
| `achievement` | Conquista desbloqueada (auto-gerado) | +5 |
| `milestone` | Marco (100 jogos, 50 gols, etc.) | +5 |
| `text_update` | Atualização de texto simples | +2 |

### 5.3 Interações Sociais

```
Post
├── Curtidas (👍 Gostei / ⚽ Golaço / 🔥 Brabo)
├── Comentários (texto, replies)
├── Compartilhar para outro grupo/atlética
└── Denunciar (moderação)
```

### 5.4 Privacidade

| Escopo | Quem Vê |
|--------|---------|
| `public` | Qualquer pessoa no app |
| `atletica` | Apenas membros da atlética |
| `group` | Apenas membros do grupo |
| `private` | Apenas o autor |

---

## 6. Perfil do Usuário Revisado

### 6.1 Tipos de Usuário

| Tipo | Descrição | Requisito |
|------|-----------|-----------|
| **Jogador** | Participa de grupos, usa features sociais | Cadastro gratuito |
| **Organizador de Pelada** | Admin de grupo independente | 200 créditos |
| **Admin de Atlética** | Gerencia múltiplos grupos | 1.000 créditos |
| **Super Admin** | Gestão da plataforma | Interno ResenhApp |

### 6.2 Wallet (Carteira) de Créditos

Cada usuário tem uma carteira de créditos pessoal (não por grupo como hoje).

```
user_wallets:
  - user_id (FK users)
  - balance (créditos disponíveis)
  - lifetime_earned (total ganho na vida)
  - lifetime_spent (total gasto na vida)
```

> Hoje a tabela `group_wallets` é por grupo. Precisará de `user_wallets` para créditos pessoais.

---

## 7. Fluxos Principais Revisados

### 7.1 Criar uma Atlética

```
Usuário quer criar uma atlética
↓
Verificar se tem ≥ 1.000 créditos → Não tem → Mostrar como obter créditos
↓
Tem créditos → Preencher dados (nome, esporte, cidade)
↓
Consumir 1.000 créditos
↓
Atlética criada → Usuário vira owner (admin máximo)
↓
Pode criar grupos de modalidade dentro da atlética
```

### 7.2 Admin Delegar Grupo de Modalidade

```
Admin da atlética cria grupo "Futebol Society - Segunda"
↓
Define: local, horário, limite de participantes, valor do treino
↓
Convidar João como admin do grupo (João pode ser externo à atlética)
↓
João aceita → vira owner do grupo com autonomia total
↓
Atlética ainda vê o grupo nos seus relatórios
```

### 7.3 Pelada Independente

```
Usuário sem atlética quer organizar pelada
↓
Verificar se tem ≥ 200 créditos → Não tem → Mostrar como obter
↓
Criar grupo independente → Escolher nome, esporte, local
↓
Cadastrar chave PIX para receber pagamentos
↓
Convidar amigos → Gerenciar presenças, cobranças, times
```

### 7.4 Ciclo de Créditos via Rede Social

```
Usuário posta foto do treino
↓
Sistema valida: é membro de algum grupo? → Sim
↓
Aguarda 24h sem denúncia → Créditos liberados: +10
↓
Usuário tem 10 créditos a mais
↓
Amigos curtem → cada um ganha +1 (até limite diário)
↓
Após 20 curtidas, usuário do post ganha bônus adicional: +5
```

---

## 8. Princípios de Design do Produto

1. **Gratuito para jogar, pago para organizar**: Qualquer pessoa pode participar de grupos. Organizar custa créditos.

2. **Créditos como engajamento**: A melhor forma de conseguir créditos grátis é usar o app ativamente. Isso cria um loop de engajamento.

3. **PIX simples**: Não complicar o pagamento. A plataforma facilita o registro, não a transferência.

4. **Hierarquia flexível**: Uma pelada simples não precisa de atlética. Uma atlética pode ter 20 modalidades com 20 admins diferentes.

5. **Transparência de dados**: Admin sempre sabe quem confirmou presença, quem disse que pagou, quem está devendo.

6. **Sem intermediação financeira**: O dinheiro do treino vai direto do participante para o admin via PIX. A plataforma não toca no dinheiro.

---

## 9. Diferenciais Competitivos

| Concorrente | Limitação | ResenhApp faz diferente |
|-------------|-----------|------------------------|
| WhatsApp | Sem gestão, sem cobrança | Gestão completa integrada |
| Planilha Google | Sem automação, sem notificação | Automatiza RSVP, times, cobranças |
| Confut/PlayersApp | Sem rede social, sem créditos | Gamificação + engajamento social |
| Sportnauta | Sem PIX nativo BR | PIX como primeiro cidadão |

---

## 10. Próximos Passos (Visão)

1. Consolidar a **hierarquia multi-tenant** no banco de dados
2. Simplificar o **sistema de PIX** para chave estática
3. Criar **user_wallets** e separar créditos pessoais de créditos de grupo
4. Implementar o **módulo social** (posts, curtidas, comentários)
5. Criar o **sistema de earning de créditos** por ações
6. Construir o **feed** por contexto (grupo/atlética/global)
7. Implementar **compra de créditos** via PIX/Mercado Pago
8. Lançar **programa de referral** para crescimento orgânico
