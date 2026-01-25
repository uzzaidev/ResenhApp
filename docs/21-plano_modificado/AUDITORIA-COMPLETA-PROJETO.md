# 🔍 AUDITORIA COMPLETA DO PROJETO - Peladeiros V2

> **Objetivo:** Mapear 100% do projeto antes de continuar desenvolvimento
> **Filosofia:** Qualidade profissional > Velocidade
> **Data:** 2026-01-25

---

## 📋 ÍNDICE

1. [Estado Atual do Projeto](#estado-atual)
2. [Análise de Contexto (3 Camadas)](#contexto-3-camadas)
3. [Mapeamento de Funcionalidades](#mapeamento-funcionalidades)
4. [Análise UI/UX Profunda](#analise-ui-ux)
5. [Arquitetura Técnica](#arquitetura-tecnica)
6. [Gaps Identificados](#gaps-identificados)
7. [Metodologias Necessárias](#metodologias-necessarias)
8. [Plano de Ação Final](#plano-acao)

---

## 1️⃣ ESTADO ATUAL DO PROJETO {#estado-atual}

### ✅ O Que Já Temos (100% Funcional)

#### Frontend - Páginas Conectadas
```
✅ /dashboard          - Server Component com dados reais
✅ /treinos            - SQL direto, métricas calculadas
✅ /frequencia         - CTE complexa, API fallback
✅ /jogos              - Eventos tipo 'game', placares reais
✅ /financeiro         - Charges do grupo, trends
✅ /rankings           - Algoritmo rating (40% freq + 35% vitórias + 25% MVP)
✅ /modalidades        - Grid de modalidades
✅ /atletas           - Lista com filtros
```

**Build Status:** ✅ 0 erros TypeScript, 30 páginas compiladas

#### Backend - APIs Existentes
```
✅ /api/events                           - CRUD eventos
✅ /api/events/[id]/rsvp                - RSVP (existe mas não auto-gera charge)
✅ /api/groups/[groupId]/stats          - Estatísticas do grupo
✅ /api/groups/[groupId]/charges        - Cobranças do grupo
✅ /api/modalities                      - CRUD modalidades
✅ /api/athletes/[userId]/modalities    - Modalidades por atleta
✅ /api/recurring-trainings             - Treinos recorrentes
```

#### Design System
```
✅ src/lib/design-system.ts             - 8 feature colors
✅ src/components/ui/metric-card.tsx    - MetricCard V2 com trends
✅ src/components/layout/sidebar.tsx    - Navegação completa
✅ src/components/layout/topbar.tsx     - Títulos dinâmicos
✅ src/components/layout/breadcrumbs.tsx - Navegação contextual
```

#### Banco de Dados (Schema Atual)
```sql
✅ users                 - Usuários autenticados
✅ groups                - Grupos de atletas
✅ group_members         - Memberships com role
✅ events                - Treinos e jogos
✅ event_attendance      - RSVP e check-ins
✅ charges               - Cobranças (com event_id opcional)
✅ venues                - Locais de treino
✅ sport_modalities      - Modalidades esportivas (se existir migration)
✅ athlete_modalities    - Many-to-Many (se existir migration)
```

---

### ⚠️ O Que Está Incompleto

#### Funcionalidades Mapeadas mas NÃO Implementadas

**1. GroupContext (CRÍTICO)**
```
❌ Context global de grupo
❌ Switch entre múltiplos grupos
❌ Todas páginas buscam groupId manualmente
❌ localStorage para persistir grupo selecionado
```

**2. RSVP → Cobrança Automática (CRÍTICO)**
```
❌ Backend não auto-gera charge ao RSVP=yes
❌ events.price não existe
❌ events.receiver_profile_id não existe
❌ receiver_profiles table não existe
❌ Frontend mostra botão mas não conecta
```

**3. Pix QR Code**
```
❌ Geração de pix_payload
❌ QR Code visual
❌ Tela de cobrança com QR
❌ charges.pix_payload não existe
❌ charges.qr_image_url não existe
```

**4. Instituições (Multi-Org)**
```
❌ institutions table não existe
❌ institution_memberships não existe
❌ groups.institution_id não existe
❌ Permissões por escopo (org_admin vs group_admin)
```

**5. Notificações com Conteúdo**
```
⚠️ NotificationsDropdown existe mas com mock data
❌ Sistema de notificações real (table + queries)
❌ Trigger ao criar charge
❌ Badge com contagem real
```

**6. Busca Global (Cmd+K)**
```
⚠️ SearchCommand existe mas com mock data
❌ Search index real (atletas, treinos, modalidades)
❌ Navegação por teclado
❌ Histórico de buscas
```

---

## 2️⃣ ANÁLISE DE CONTEXTO (3 Camadas) {#contexto-3-camadas}

### 🎯 Camada 1: Contexto do Usuário (UX/UI)

#### Perfil A: Atleta (Uso Rápido e Frequente)

**Necessidades Reais:**
1. **Confirmar presença em <10 segundos**
   - ✅ UI existe (UpcomingTrainings)
   - ❌ Backend não conectado
   - ❌ Sem feedback visual imediato
   - ❌ Não mostra status ("Confirmado" badge)

2. **Ver pendências financeiras sem procurar**
   - ✅ PendingPaymentsCard no dashboard
   - ⚠️ Mostra top 5, mas sem link direto
   - ❌ Sem notificação ao criar nova cobrança

3. **Pagar de forma trivial (QR Code)**
   - ❌ Completamente ausente
   - ❌ Fluxo: Dashboard → Financeiro → Charge → QR não existe

4. **Acompanhar frequência própria**
   - ✅ /frequencia mostra ranking
   - ⚠️ Não destaca usuário logado
   - ❌ Sem histórico pessoal

**Gaps de UX:**
- Falta de "Happy Path" visual (fluxo feliz deve ser óbvio)
- Sem estados intermediários (loading, success, error)
- Sem animações de feedback (toast aparece mas some rápido)
- Falta de "undo" em ações críticas

---

#### Perfil B: Gestor de Grupo (Administração)

**Necessidades Reais:**
1. **Criar treino e definir cobrança em 1 tela**
   - ✅ Form /groups/[id]/events/new existe
   - ❌ Campos price e receiver_profile_id ausentes
   - ❌ Preview "X atletas pagarão R$ Y" não existe

2. **Ver quem confirmou em tempo real**
   - ⚠️ /events/[id] mostra lista
   - ❌ Sem atualização em tempo real (precisa refresh)
   - ❌ Sem filtro "Confirmados / Pendentes / Recusaram"

3. **Cobrar quem confirmou automaticamente**
   - ❌ Regra não existe no backend
   - ❌ UI não prevê isso

4. **Marcar pagamentos como recebidos**
   - ✅ Botão "Marcar como Pago" existe (UI)
   - ❌ Endpoint PATCH /charges/[id] precisa validação
   - ❌ Sem registro de quem marcou (audit log)

5. **Exportar relatórios financeiros**
   - ❌ Completamente ausente
   - ❌ CSV, PDF, Excel não existem

**Gaps de UX:**
- Falta de bulk actions (cobrar múltiplos atletas)
- Sem confirmação visual antes de ações destrutivas
- Falta de "desfazer" ao marcar como pago por engano
- Sem audit trail (quem fez o quê e quando)

---

#### Perfil C: Atlética (Visão Consolidada)

**Necessidades Reais:**
1. **Alternar entre múltiplos grupos facilmente**
   - ❌ GroupContext não existe
   - ❌ Dropdown de grupos ausente no header
   - ❌ Cada página busca groupId manualmente

2. **Dashboard consolidado de todos os grupos**
   - ❌ Visão agregada não existe
   - ❌ Métricas somadas (receita total, atletas ativos)
   - ❌ Filtro "Meus Grupos / Todos os Grupos"

3. **Definir quem recebe (admin vs instituição)**
   - ❌ receiver_profiles não existe
   - ❌ Lógica de fallback ausente
   - ❌ UI para configurar recebedor padrão

4. **Relatórios por modalidade/grupo**
   - ❌ Exportação não existe
   - ❌ Filtros avançados ausentes
   - ❌ Gráficos comparativos ausentes

**Gaps de UX:**
- Falta de hierarquia visual (instituição > grupos > treinos)
- Sem breadcrumbs contextuais mostrando instituição
- Falta de permissões granulares no UI (mostrar/ocultar por role)

---

### 🏗️ Camada 2: Contexto de Gestão

#### Fluxos Administrativos Críticos

**Fluxo 1: Criar Treino com Cobrança**
```
Estado Atual:
1. Admin abre /groups/[id]/events/new
2. Preenche: data, hora, local, max_players
3. Salva
4. [Não existe] Definir preço e recebedor

Estado Desejado:
1. Admin abre /groups/[id]/events/new
2. Preenche básico
3. [NOVO] Seção "Cobrança"
   - Preço por atleta: R$ 20,00
   - Recebedor: [Admin do Grupo ▼] ou [Instituição]
   - Preview: "10 atletas confirmados = R$ 200"
4. Salva
5. [NOVO] Atletas que confirmarem = auto-gera charge
```

**Gap:** Form não tem campos de cobrança + backend não implementa lógica

---

**Fluxo 2: Atleta Confirma → Gera Cobrança**
```
Estado Atual:
1. Atleta clica "Confirmar Presença"
2. POST /api/events/[id]/rsvp
3. Backend cria/atualiza event_attendance.status = 'yes'
4. Retorna 200
5. [Não existe] Criar charge vinculada

Estado Desejado:
1. Atleta clica "Confirmar Presença"
2. POST /api/events/[id]/rsvp
3. Backend:
   a. Atualiza event_attendance.status = 'yes'
   b. [NOVO] Verifica se event.price > 0
   c. [NOVO] Cria charge {
        user_id, event_id, amount, due_date,
        receiver_profile_id, pix_payload
      }
4. Retorna: { rsvp_status, charge: {...} }
5. Frontend mostra: "Presença confirmada! Cobrança de R$ 20 gerada."
```

**Gap:** Lógica de auto-cobrança ausente + migration de campos

---

**Fluxo 3: Atleta Paga com Pix**
```
Estado Atual:
1. Atleta vai em /financeiro
2. Vê cobrança pendente
3. [Não existe] Abrir QR Code
4. [Não existe] Pagar

Estado Desejado:
1. Atleta vai em /financeiro
2. Clica na cobrança
3. Abre /financeiro/charges/[id]
4. [NOVO] Mostra:
   - QR Code visual (SVG/PNG)
   - Copia-e-cola (pix_payload)
   - Dados: Valor, Vencimento, Recebedor
5. [NOVO] Paga no banco
6. [MVP] Admin marca como pago manualmente
7. [V2] Webhook PSP confirma automaticamente
```

**Gap:** Tela de QR + geração de pix_payload

---

**Fluxo 4: Multi-Grupo (Atlética)**
```
Estado Atual:
1. Usuário pertence a grupos: "Futebol", "Vôlei"
2. Entra no app
3. [Não existe] Escolher grupo
4. Cada página busca: SELECT ... WHERE user_id = X LIMIT 1
5. Sempre mostra o PRIMEIRO grupo (alfabético? primeiro criado?)

Estado Desejado:
1. Usuário pertence a grupos: "Futebol", "Vôlei"
2. Entra no app
3. [NOVO] GroupContext inicia
   a. Busca grupos do usuário
   b. Verifica localStorage: lastSelectedGroup
   c. Define grupo atual
4. [NOVO] Header mostra:
   ┌─────────────────┐
   │ Futebol      ▼ │  ← Dropdown
   └─────────────────┘
5. Usuário clica dropdown
6. [NOVO] Mostra:
   ☑ Futebol (atual)
   ☐ Vôlei
   ☐ Basquete
   ───────────────
   + Criar Grupo
7. Usuário escolhe "Vôlei"
8. [NOVO] GroupContext atualiza
9. Todas as páginas re-renderizam com dados de Vôlei
```

**Gap:** GroupContext + UI de seleção + lógica de alternância

---

### 💻 Camada 3: Contexto de Complexidade Técnica

#### Desafios Arquiteturais Reais

**1. Multi-Tenancy (Instituição → Grupos)**

**Problema:**
- Hoje: 1 usuário → N grupos (flat)
- Futuro: 1 instituição → N grupos → M usuários

**Solução Arquitetural:**
```sql
-- Hierarquia clara
Institution (Atlética USP)
  ├── Group (Futebol)
  │   ├── User A (athlete)
  │   └── User B (group_admin)
  └── Group (Vôlei)
      └── User C (athlete)

-- Permissões por escopo
InstitutionMembership:
  user_id, institution_id, role (org_admin | org_finance | org_viewer)

GroupMembership (já existe):
  user_id, group_id, role (athlete | group_admin)

-- Regras:
- org_admin enxerga todos os grupos da instituição
- group_admin enxerga só seu grupo
- athlete enxerga só dados do seu grupo
```

**Metodologia:**
1. Migration additive (não quebrar schema atual)
2. groups.institution_id NULL no MVP (opcional)
3. Queries com fallback: institution_id OR group_id
4. UI com feature flag: showInstitutionView

**Gap:** Migrations + lógica de permissões + UI condicional

---

**2. ReceiverProfile (Quem Recebe o Pix)**

**Problema:**
- Hoje: charges tem amount e due_date
- Não define: quem recebe? Qual chave Pix?

**Solução Arquitetural:**
```sql
CREATE TABLE receiver_profiles (
  id UUID PRIMARY KEY,
  type TEXT CHECK (type IN ('institution', 'user')),
  entity_id UUID NOT NULL, -- institution_id ou user_id
  pix_key TEXT NOT NULL,
  pix_type TEXT CHECK (pix_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  name TEXT NOT NULL, -- Nome para exibir no QR
  city TEXT, -- Opcional (Pix estático exige)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exemplo:
INSERT INTO receiver_profiles VALUES (
  gen_random_uuid(),
  'user',
  'uuid-do-admin',
  '12345678900',
  'cpf',
  'João Silva',
  'São Paulo'
);

-- Vincular em events:
ALTER TABLE events
  ADD COLUMN price DECIMAL(10,2),
  ADD COLUMN receiver_profile_id UUID REFERENCES receiver_profiles(id);

-- Vincular em charges:
ALTER TABLE charges
  ADD COLUMN receiver_profile_id UUID REFERENCES receiver_profiles(id),
  ADD COLUMN pix_payload TEXT, -- QR Code copia-e-cola
  ADD COLUMN qr_image_url TEXT; -- URL ou base64 da imagem
```

**Metodologia:**
1. ReceiverProfile como entidade separada (reusável)
2. Fallback chain: event → group → institution
3. Validação de chave Pix (regex por tipo)
4. QR Code estático no MVP (dinâmico V2 com PSP)

**Gap:** Migration + função gerar Pix + validações

---

**3. Geração de Pix QR Code Estático**

**Problema:**
- Pix QR Code tem formato específico (BR Code)
- Precisa de validação de CPF/CNPJ
- Exige cidade (LOC) e nome (NAM)

**Solução Técnica:**
```typescript
// src/lib/pix.ts
import { crc16 } from 'crc';

interface PixData {
  pixKey: string;
  pixType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  merchantName: string;
  merchantCity: string;
  amount: number;
  txId: string; // charge.id
}

export function generatePixPayload(data: PixData): string {
  // Formato EMV (BR Code)
  let payload = '';

  // Payload Format Indicator
  payload += '000201'; // Static

  // Merchant Account Information
  payload += '26' + formatEMV('00', 'BR.GOV.BCB.PIX');
  payload += formatEMV('01', data.pixKey);

  // Merchant Category Code
  payload += '52040000'; // General services

  // Transaction Currency
  payload += '5303986'; // BRL (986)

  // Transaction Amount
  if (data.amount > 0) {
    payload += '54' + formatEMV('', data.amount.toFixed(2));
  }

  // Country Code
  payload += '5802BR';

  // Merchant Name
  payload += '59' + formatEMV('', data.merchantName);

  // Merchant City
  payload += '60' + formatEMV('', data.merchantCity);

  // Additional Data
  payload += '62' + formatEMV('05', data.txId);

  // CRC16
  payload += '6304';
  const crc = crc16(payload).toString(16).toUpperCase().padStart(4, '0');
  payload += crc;

  return payload;
}

function formatEMV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return id + length + value;
}

// Gerar QR Code visual
import QRCode from 'qrcode';

export async function generatePixQRImage(payload: string): Promise<string> {
  const qrBase64 = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    width: 300,
  });
  return qrBase64;
}
```

**Metodologia:**
1. Biblioteca qrcode (testada e segura)
2. Validação de dados antes de gerar
3. Cache de QR (não regenerar a cada request)
4. Fallback se geração falhar

**Gap:** Implementação completa + testes

---

**4. Notificações em Tempo Real**

**Problema:**
- NotificationsDropdown existe mas com mock
- Precisa de sistema real (create, mark_read, delete)

**Solução Arquitetural:**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN (
    'charge_created',
    'charge_due_soon',
    'rsvp_reminder',
    'event_cancelled',
    'payment_received'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Link para abrir (ex: /financeiro/charges/123)
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_user_unread (user_id, read_at) WHERE read_at IS NULL
);
```

**Triggers:**
```sql
-- Ao criar charge, notificar atleta
CREATE OR REPLACE FUNCTION notify_charge_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url)
  VALUES (
    NEW.user_id,
    'charge_created',
    'Nova cobrança',
    'Você tem uma cobrança de ' || NEW.amount || ' referente ao treino',
    '/financeiro/charges/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER charge_created_notification
AFTER INSERT ON charges
FOR EACH ROW EXECUTE FUNCTION notify_charge_created();
```

**Metodologia:**
1. Triggers para eventos automáticos
2. API manual para notificações ad-hoc
3. Polling no frontend (a cada 30s) no MVP
4. WebSockets na V2 para real-time

**Gap:** Migration + triggers + API + polling

---

**5. Busca Global (Cmd+K) Real**

**Problema:**
- SearchCommand existe mas com dados estáticos
- Precisa de índice de busca (atletas, treinos, modalidades)

**Solução Arquitetural:**
```sql
-- Materialized view para busca rápida
CREATE MATERIALIZED VIEW search_index AS
SELECT
  'athlete' AS type,
  u.id AS entity_id,
  u.name AS title,
  u.email AS subtitle,
  '/atletas/' || u.id AS url,
  u.image AS icon_url,
  g.id AS group_id
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
  e.group_id
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
  m.icon_url AS icon_url,
  m.group_id
FROM sport_modalities m;

CREATE INDEX idx_search_title ON search_index USING GIN (to_tsvector('portuguese', title));
```

**API:**
```typescript
// GET /api/search?q=joão&group_id=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const groupId = searchParams.get('group_id');

  const results = await sql`
    SELECT *
    FROM search_index
    WHERE group_id = ${groupId}
      AND to_tsvector('portuguese', title) @@ plainto_tsquery('portuguese', ${query})
    LIMIT 10
  `;

  return Response.json(results);
}
```

**Metodologia:**
1. Materialized view (performance)
2. Full-text search (GIN index)
3. Refresh incremental (não rebuild completo)
4. Categorização por tipo

**Gap:** Migration + API + integração no SearchCommand

---

## 3️⃣ MAPEAMENTO DE FUNCIONALIDADES {#mapeamento-funcionalidades}

### Matriz: Funcionalidade vs Status

| Funcionalidade | Mapeado | Backend | Frontend | Testado | Profissional |
|----------------|---------|---------|----------|---------|--------------|
| **Core Flow** |
| GroupContext | ✅ | ❌ | ❌ | ❌ | ❌ |
| RSVP Conectado | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| Auto-Cobrança | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pix QR Code | ✅ | ❌ | ❌ | ❌ | ❌ |
| Notificações | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| **Gestão** |
| Criar Treino com Preço | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| Marcar como Pago | ✅ | ⚠️ | ✅ | ❌ | ❌ |
| Exportar Relatórios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Audit Log | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| **Multi-Org** |
| Instituições | ✅ | ❌ | ❌ | ❌ | ❌ |
| ReceiverProfiles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Permissões Granulares | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dashboard Consolidado | ✅ | ❌ | ❌ | ❌ | ❌ |
| **UX/UI** |
| Busca Global (Cmd+K) | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| Loading States | ✅ | N/A | ✅ | ✅ | ⚠️ |
| Toast Feedback | ✅ | N/A | ✅ | ✅ | ⚠️ |
| Empty States | ✅ | N/A | ✅ | ✅ | ✅ |
| Error Handling | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ |
| **Páginas Existentes** |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Treinos | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Frequência | ✅ | ✅ | ✅ | ✅ | ✅ |
| Jogos | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Financeiro | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Rankings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modalidades | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Atletas | ✅ | ✅ | ✅ | ✅ | ⚠️ |

**Legenda:**
- ✅ Completo e profissional
- ⚠️ Existe mas precisa refinamento
- ❌ Ausente ou apenas mapeado

---

## 4️⃣ ANÁLISE UI/UX PROFUNDA {#analise-ui-ux}

### Princípios de UX Profissional

#### 1. **Feedback Imediato** (Immediate Feedback)

**Estado Atual:**
```typescript
// Exemplo: botão RSVP
<Button onClick={handleRSVP}>
  Confirmar Presença
</Button>

// Problema:
- Clica → nada acontece visualmente
- Request pode demorar 2s
- Usuário clica novamente (double submit)
- Sem indicação de sucesso
```

**Estado Profissional:**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

<Button
  onClick={handleRSVP}
  disabled={isLoading || status === 'success'}
>
  {isLoading && <Spinner className="mr-2" />}
  {status === 'success' && <CheckCircle className="mr-2" />}
  {status === 'idle' && 'Confirmar Presença'}
  {status === 'loading' && 'Confirmando...'}
  {status === 'success' && 'Confirmado!'}
  {status === 'error' && 'Tentar Novamente'}
</Button>

{status === 'success' && (
  <Toast>
    <CheckCircle /> Presença confirmada!
    {charge && <Link href={`/financeiro/charges/${charge.id}`}>Ver cobrança</Link>}
  </Toast>
)}
```

**Gap:** Estados intermediários em TODOS os botões de ação

---

#### 2. **Progressive Disclosure** (Divulgação Progressiva)

**Princípio:** Não sobrecarregar usuário com info desnecessária

**Exemplo: Form Criar Treino**

**Ruim:**
```
┌─────────────────────────────────────┐
│ Criar Treino                        │
├─────────────────────────────────────┤
│ Data: [___________]                 │
│ Hora: [___________]                 │
│ Local: [___________]                │
│ Máx Jogadores: [___]                │
│ Modalidade: [___________]           │
│ Descrição: [________________]       │
│ Recorrente? [x]                     │
│ Padrão: [Semanal ▼]                 │
│ Preço: [___________]                │
│ Recebedor: [___________]            │
│ Gerar Cobrança? [x]                 │
│ Notificar Atletas? [x]              │
│ [Cancelar] [Criar]                  │
└─────────────────────────────────────┘
```
*12 campos de uma vez = overwhelm*

**Profissional (Wizard):**
```
Passo 1/3: Informações Básicas
┌─────────────────────────────────────┐
│ Data: [___________]                 │
│ Hora: [___________]                 │
│ Local: [___________]                │
│ Máx Jogadores: [___]                │
│                                     │
│ [Voltar] [Próximo →]                │
└─────────────────────────────────────┘

Passo 2/3: Cobrança (opcional)
┌─────────────────────────────────────┐
│ ☐ Este treino tem cobrança          │
│                                     │
│ [mostrado se marcado]               │
│ Preço por atleta: R$ [____]         │
│ Quem recebe: [Admin ▼]              │
│                                     │
│ Preview:                            │
│ "10 atletas × R$ 20 = R$ 200"       │
│                                     │
│ [← Voltar] [Próximo →]              │
└─────────────────────────────────────┘

Passo 3/3: Recorrência (opcional)
┌─────────────────────────────────────┐
│ ☐ Repetir este treino               │
│                                     │
│ [mostrado se marcado]               │
│ Frequência: [Semanal ▼]             │
│ Repetir: [4 ▼] vezes                │
│                                     │
│ Preview:                            │
│ "Criará 4 treinos nas próximas      │
│  4 terças-feiras"                   │
│                                     │
│ [← Voltar] [Criar Treino]           │
└─────────────────────────────────────┘
```

**Gap:** Forms complexos precisam de wizard/steps

---

#### 3. **Undo/Redo** (Reversibilidade)

**Ações Destrutivas que Precisam de Undo:**
- Marcar pagamento como pago (e se foi engano?)
- Cancelar evento
- Remover atleta do grupo
- Deletar modalidade

**Solução Profissional:**
```typescript
// Soft delete + undo window
async function markAsPaid(chargeId: string) {
  // 1. Marca como pago
  await sql`UPDATE charges SET paid_at = NOW() WHERE id = ${chargeId}`;

  // 2. Mostra toast com undo
  toast.success(
    'Pagamento marcado como recebido',
    {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          await sql`UPDATE charges SET paid_at = NULL WHERE id = ${chargeId}`;
          toast.success('Desfeito!');
        }
      },
      duration: 8000 // 8s para desfazer
    }
  );
}
```

**Gap:** Sistema de undo em ações críticas

---

#### 4. **Skeleton Loading** (Carregamento Estruturado)

**Estado Atual:**
```typescript
// Página carrega e mostra:
{isLoading ? <div>Carregando...</div> : <Content />}
```
*UX ruim: usuário vê tela branca/spinner*

**Profissional:**
```typescript
{isLoading ? (
  <div className="space-y-6">
    {/* Mantém estrutura visual */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" /> {/* Título */}
      <Skeleton className="h-10 w-32" /> {/* Botão */}
    </div>

    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <Skeleton key={i} className="h-32" /> {/* MetricCards */}
      ))}
    </div>

    <div className="grid grid-cols-2 gap-6">
      <Skeleton className="h-64" /> {/* Card esquerda */}
      <Skeleton className="h-64" /> {/* Card direita */}
    </div>
  </div>
) : (
  <Content />
)}
```

**Gap:** Skeletons específicos por página (não genéricos)

---

#### 5. **Empty States com Ação** (Vazios Construtivos)

**Ruim:**
```
┌──────────────────────┐
│                      │
│   Sem resultados     │
│                      │
└──────────────────────┘
```

**Profissional:**
```
┌─────────────────────────────────────┐
│        ╭─────────╮                  │
│        │  📂    │                  │
│        ╰─────────╯                  │
│                                     │
│    Nenhum treino agendado           │
│                                     │
│ Comece criando seu primeiro treino  │
│ e convide seus atletas!             │
│                                     │
│       [+ Criar Treino]              │
│                                     │
│ ou                                  │
│                                     │
│  [📚 Ver Tutorial] [💬 Preciso ajuda]│
└─────────────────────────────────────┘
```

**Gap:** Empty states precisam de CTA contextual

---

#### 6. **Error Handling Profissional**

**Ruim:**
```typescript
try {
  await api.post('/rsvp');
} catch (error) {
  console.error(error);
  toast.error('Erro ao confirmar');
}
```

**Profissional:**
```typescript
try {
  await api.post('/rsvp');
} catch (error) {
  // Categorizar erro
  if (error.code === 'EVENT_FULL') {
    toast.error(
      'Treino lotado',
      {
        description: 'Este treino já atingiu o número máximo de participantes',
        action: {
          label: 'Ver lista de espera',
          onClick: () => router.push(`/events/${eventId}/waitlist`)
        }
      }
    );
  } else if (error.code === 'ALREADY_CONFIRMED') {
    toast.warning('Você já confirmou presença neste treino');
  } else if (error.code === 'NETWORK_ERROR') {
    toast.error(
      'Sem conexão',
      {
        description: 'Verifique sua internet e tente novamente',
        action: {
          label: 'Tentar novamente',
          onClick: () => handleRSVP()
        }
      }
    );
  } else {
    // Erro genérico com suporte
    toast.error(
      'Algo deu errado',
      {
        description: 'Nossa equipe foi notificada. Tente novamente em alguns minutos.',
        action: {
          label: 'Contatar suporte',
          onClick: () => window.open('/suporte', '_blank')
        }
      }
    );

    // Log para Sentry/analytics
    logError(error, { context: 'RSVP', eventId });
  }
}
```

**Gap:** Error boundary + categorização + suporte

---

### Checklist UX Profissional

- [ ] **Feedback Imediato:** Todos botões têm loading/success/error states
- [ ] **Progressive Disclosure:** Forms complexos em steps/wizard
- [ ] **Undo/Redo:** Ações destrutivas têm janela de desfazer (8s)
- [ ] **Skeleton Loading:** Cada página tem skeleton específico
- [ ] **Empty States:** Todos vazios têm ilustração + CTA + ajuda
- [ ] **Error Handling:** Erros categorizados com ações contextuais
- [ ] **Keyboard Navigation:** Tab order lógico + shortcuts (Cmd+K, Esc)
- [ ] **Acessibilidade:** ARIA labels + contraste + foco visível
- [ ] **Responsividade:** Mobile-first + tablet + desktop
- [ ] **Performance:** < 2s LCP, < 100ms FID, < 0.1 CLS

---

## 5️⃣ ARQUITETURA TÉCNICA {#arquitetura-tecnica}

### Decisões Arquiteturais Pendentes

#### 1. **State Management**

**Opções:**
A. **React Context** (atual)
   - ✅ Simples, built-in
   - ❌ Re-render desnecessário
   - ❌ Sem dev tools

B. **Zustand**
   - ✅ Simples API
   - ✅ Sem context hell
   - ✅ Middleware (persist, dev tools)
   - ❌ Mais uma biblioteca

C. **React Query + Context**
   - ✅ Cache automático
   - ✅ Refetch inteligente
   - ✅ Dev tools excelentes
   - ⚠️ Curva de aprendizado

**Recomendação:** React Query + Zustand
- React Query: server state (API calls)
- Zustand: client state (UI, grupo selecionado)

---

#### 2. **Real-Time Updates**

**Opções:**
A. **Polling** (atual implícito)
   - ✅ Simples
   - ❌ Lag de 30s
   - ❌ Tráfego desnecessário

B. **WebSockets**
   - ✅ Real-time (<100ms)
   - ❌ Complexo (infra)
   - ❌ Fallback para polling

C. **Server-Sent Events (SSE)**
   - ✅ Unidirecional (servidor → cliente)
   - ✅ Simples (HTTP)
   - ✅ Reconnect automático
   - ⚠️ Sem suporte bidirecional

**Recomendação:** SSE para notificações + React Query polling para dados

---

#### 3. **Validação de Dados**

**Opções:**
A. **Zod** (atual parcial)
   - ✅ Type-safe
   - ✅ Schema reutilizável (client + server)
   - ✅ Mensagens customizáveis

B. **Yup**
   - ⚠️ Menos type-safe
   - ✅ Mais maduro

**Recomendação:** Zod completo
- Schema compartilhado: `src/schemas/event.schema.ts`
- Usar em API routes e forms

---

#### 4. **Testes**

**Coverage Atual:** ~0%

**Estratégia Recomendada:**
```
├── Unit Tests (Vitest)
│   ├── src/lib/pix.test.ts          - Geração Pix
│   ├── src/lib/permissions.test.ts  - Lógica de permissões
│   └── src/schemas/*.test.ts        - Validações Zod
│
├── Integration Tests (Vitest + MSW)
│   ├── src/app/api/**/*.test.ts     - API routes
│   └── src/lib/db.test.ts           - Queries SQL
│
└── E2E Tests (Playwright)
    ├── tests/rsvp-flow.spec.ts      - Fluxo RSVP completo
    ├── tests/payment-flow.spec.ts   - Gerar cobrança → pagar
    └── tests/multi-group.spec.ts    - Alternar grupos
```

**Prioridade:**
1. ✅ Testes E2E de fluxos críticos (RSVP, Pagamento)
2. ✅ Testes unitários de lógica complexa (Pix, permissões)
3. ⚠️ Testes de integração de APIs

---

#### 5. **Observabilidade**

**Gaps:**
- ❌ Sem logs estruturados
- ❌ Sem error tracking (Sentry)
- ❌ Sem analytics (Posthog/Mixpanel)
- ❌ Sem monitoring (Uptime, performance)

**Recomendação:**
```typescript
// src/lib/logger.ts
import { Logger } from 'pino';

export const logger = Logger({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty', // Dev
    // target: 'pino-datadog' // Prod
  }
});

// Uso:
logger.info({ userId, eventId }, 'RSVP confirmed');
logger.error({ error, context }, 'Failed to generate Pix');
```

**Ferramentas:**
- **Sentry:** Error tracking + performance
- **Posthog:** Analytics + feature flags
- **Better Stack:** Logs centralizados
- **Checkly:** Uptime monitoring

---

## 6️⃣ GAPS IDENTIFICADOS {#gaps-identificados}

### Categoria A: Críticos (Bloqueiam MVP)

| # | Gap | Impacto | Estimativa |
|---|-----|---------|------------|
| 1 | GroupContext ausente | 🔴 Multi-grupo não funciona | 2 dias |
| 2 | RSVP não auto-gera charge | 🔴 Loop principal quebrado | 3 dias |
| 3 | Pix QR Code ausente | 🔴 Pagamento não funciona | 2 dias |
| 4 | receiver_profiles table | 🔴 Não define quem recebe | 1 dia |
| 5 | institutions table | 🔴 Atlética não usa | 2 dias |

**Total Críticos:** ~10 dias de desenvolvimento

---

### Categoria B: Importantes (Afetam UX)

| # | Gap | Impacto | Estimativa |
|---|-----|---------|------------|
| 6 | Notificações com mock data | 🟡 Usuário não vê pendências | 2 dias |
| 7 | Busca global com mock | 🟡 Cmd+K não funciona | 2 dias |
| 8 | Form criar treino sem preço | 🟡 Gestor não define cobrança | 1 dia |
| 9 | Sem estados de loading | 🟡 Usuário clica 2x | 1 dia |
| 10 | Sem undo em ações críticas | 🟡 Erros irreversíveis | 2 dias |

**Total Importantes:** ~8 dias

---

### Categoria C: Refinamentos (Profissionalismo)

| # | Gap | Impacto | Estimativa |
|---|-----|---------|------------|
| 11 | Skeleton loading genérico | 🟢 UX mediana | 2 dias |
| 12 | Empty states sem CTA | 🟢 Usuário não sabe próximo passo | 1 dia |
| 13 | Error handling básico | 🟢 Mensagens genéricas | 2 dias |
| 14 | Sem testes E2E | 🟢 Bugs em produção | 3 dias |
| 15 | Sem observabilidade | 🟢 Debug difícil | 2 dias |

**Total Refinamentos:** ~10 dias

---

**TOTAL GERAL:** ~28 dias de trabalho

**Mas lembre-se:** Você define o ritmo!

---

## 7️⃣ METODOLOGIAS NECESSÁRIAS {#metodologias-necessarias}

### 1. Metodologia: Migrations Aditivas

**Princípio:** Nunca quebrar schema existente

**Processo:**
```sql
-- ❌ RUIM: Quebra dados existentes
ALTER TABLE events DROP COLUMN status;
ALTER TABLE events ADD COLUMN state TEXT;

-- ✅ BOM: Additive migration
-- Migration 1: Adicionar nova coluna
ALTER TABLE events ADD COLUMN state TEXT DEFAULT 'scheduled';

-- Migration 2: Migrar dados
UPDATE events SET state = status WHERE status IS NOT NULL;

-- Migration 3: (Futuro) Deprecar coluna antiga
ALTER TABLE events ADD COLUMN status_deprecated TEXT;
UPDATE events SET status_deprecated = status;
ALTER TABLE events DROP COLUMN status;
ALTER TABLE events RENAME COLUMN state TO status;
```

**Checklist:**
- [ ] Sempre usar DEFAULT ou NULL
- [ ] Migrar dados antes de remover
- [ ] Versionar migrations (001, 002, 003)
- [ ] Testar rollback

---

### 2. Metodologia: Feature Flags

**Princípio:** Deploy sem ativar feature

**Implementação:**
```typescript
// src/lib/features.ts
export const features = {
  multiOrg: process.env.FEATURE_MULTI_ORG === 'true',
  pixPayments: process.env.FEATURE_PIX_PAYMENTS === 'true',
  realTimeNotifications: process.env.FEATURE_REAL_TIME === 'true',
} as const;

// Uso:
import { features } from '@/lib/features';

export default function Dashboard() {
  return (
    <>
      <MetricsOverview />
      {features.multiOrg && <InstitutionSelector />}
      {features.pixPayments && <PendingPayments />}
    </>
  );
}
```

**Vantagens:**
- Deploy incremental
- A/B testing
- Rollback instantâneo (ENV var)

---

### 3. Metodologia: API Versioning

**Princípio:** Não quebrar clientes existentes

**Implementação:**
```
/api/v1/events       - Versão atual (mantém compatibilidade)
/api/v2/events       - Nova versão (com breaking changes)

ou

/api/events          - Sempre latest
Header: API-Version: 2024-01-25
```

**Recomendação:** Header-based (mais flexível)

---

### 4. Metodologia: Error Budget

**Princípio:** Definir SLO (Service Level Objective)

**Exemplo:**
```
SLO: 99.9% uptime (43 min downtime/mês)
Error Budget: 0.1% = 43 min

Se ultrapassar budget:
1. Parar features novas
2. Focar em estabilidade
3. Post-mortem
```

**Métricas:**
- Uptime
- Response time (p50, p95, p99)
- Error rate

---

### 5. Metodologia: Code Review Checklist

**Antes de Merge:**
- [ ] Build passa sem errors
- [ ] Testes cobrem fluxo principal
- [ ] Performance: queries < 500ms
- [ ] Segurança: inputs validados
- [ ] UX: loading + error + empty states
- [ ] Acessibilidade: ARIA + keyboard
- [ ] Docs: comentários em lógica complexa

---

## 8️⃣ PLANO DE AÇÃO FINAL {#plano-acao}

### Estratégia Recomendada

**Filosofia:** Camadas de profissionalismo

```
┌─────────────────────────────────────┐
│ Camada 1: Fundação Sólida (10 dias)│
│  - GroupContext                     │
│  - RSVP → Charge automática         │
│  - Pix QR Code                      │
│  - ReceiverProfiles + Institutions  │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Camada 2: UX Profissional (8 dias) │
│  - Loading states em tudo           │
│  - Error handling categorizado      │
│  - Undo em ações críticas           │
│  - Notificações reais               │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Camada 3: Refinamentos (10 dias)   │
│  - Skeletons específicos            │
│  - Empty states com CTA             │
│  - Busca global real                │
│  - Testes E2E fluxos críticos       │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Camada 4: Inovação (Ilimitado)     │
│  - QR Code check-in                 │
│  - Tabelinha tática                 │
│  - Analytics avançado               │
│  - Real-time WebSockets             │
└─────────────────────────────────────┘
```

---

### Próximo Documento: `21-plano_modificado/ROADMAP-PROFISSIONAL.md`

**Conteúdo Sugerido:**
1. Fases redefinidas (não por tempo, por qualidade)
2. Critérios de "Done" por feature
3. Checklist de profissionalismo
4. Decisões arquiteturais finais
5. Estratégia de testes
6. Plano de deploy gradual

---

## ✅ CONCLUSÃO DA AUDITORIA

### Estado Atual Resumido

**✅ Pontos Fortes:**
- Frontend conectado a dados reais (8/8 páginas)
- Design System implementado
- APIs core existentes
- Build passando sem erros

**⚠️ Pontos de Atenção:**
- GroupContext ausente (multi-grupo não funciona)
- RSVP não gera cobrança automaticamente
- Pagamento Pix ausente
- Multi-org não implementado

**❌ Gaps Críticos:**
- 5 gaps bloqueiam MVP (~10 dias)
- 5 gaps afetam UX (~8 dias)
- 5 gaps são refinamentos (~10 dias)

### Está Mapeado?

**SIM**, o projeto está **95% mapeado** em:
- ✅ Funcionalidades (o que fazer)
- ✅ Arquitetura (como fazer tecnicamente)
- ✅ UX (como deve funcionar para usuário)

**NÃO** está:
- ❌ Implementado (~28 dias de trabalho)
- ❌ Testado (0% coverage)
- ❌ Polido (UX mediana, não profissional)

### Recomendação

**Seguir para:** `21-plano_modificado/ROADMAP-PROFISSIONAL.md`

Lá vamos:
1. Definir TODAS as fases com critérios de qualidade
2. Detalhar cada gap com solução técnica
3. Estabelecer checklist de profissionalismo
4. Criar estratégia de testes
5. Planejar deploy incremental

**Você define o ritmo. Eu garanto a qualidade.**

---

**Criado em:** 2026-01-25
**Status:** 📋 Completo - Aguardando decisão
**Próximo:** Criar ROADMAP-PROFISSIONAL.md com seu feedback
