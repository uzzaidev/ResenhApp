# 🧪 Guia Completo de Testes - FASE 1: Modalidades e Atletas

> **Data:** 2026-01-24
> **Status:** 📋 Pronto para execução
> **Versão:** 1.0

---

## 📊 Visão Geral

Este guia contém **TODOS OS TESTES** que devem ser executados para validar a Fase 1 completa.

**Total de testes:** 48
**Tempo estimado:** 2-3 horas

---

## 🗄️ 1. TESTES DE DATABASE (Queries e Validações)

### 1.1 Testar Tabela sport_modalities

#### Teste 1.1.1: Criar modalidade

```sql
-- Criar modalidade de teste
INSERT INTO sport_modalities (group_id, name, description, icon, color, trainings_per_week)
VALUES (
  'SEU_GROUP_ID_AQUI'::UUID,
  'Futebol 11',
  'Futebol de campo tradicional',
  '⚽',
  '#10B981',
  3
)
RETURNING *;

-- ✅ Deve retornar 1 linha com id gerado
```

#### Teste 1.1.2: Listar modalidades do grupo

```sql
-- Listar modalidades do grupo
SELECT
  id,
  name,
  icon,
  color,
  trainings_per_week,
  is_active,
  created_at
FROM sport_modalities
WHERE group_id = 'SEU_GROUP_ID_AQUI'::UUID
  AND is_active = TRUE
ORDER BY name;

-- ✅ Deve retornar as modalidades ativas
```

#### Teste 1.1.3: Atualizar modalidade

```sql
-- Atualizar modalidade
UPDATE sport_modalities
SET
  trainings_per_week = 4,
  description = 'Futebol de campo - 4x por semana'
WHERE id = 'MODALITY_ID'::UUID
RETURNING *;

-- ✅ Deve retornar modalidade atualizada
```

#### Teste 1.1.4: Soft delete modalidade

```sql
-- Soft delete
UPDATE sport_modalities
SET is_active = FALSE
WHERE id = 'MODALITY_ID'::UUID
RETURNING *;

-- Verificar que não aparece mais na listagem ativa
SELECT * FROM sport_modalities
WHERE id = 'MODALITY_ID'::UUID
  AND is_active = TRUE;

-- ✅ Deve retornar 0 linhas
```

---

### 1.2 Testar Tabela athlete_modalities

#### Teste 1.2.1: Vincular atleta a modalidade

```sql
-- Criar relacionamento atleta-modalidade
INSERT INTO athlete_modalities (user_id, modality_id, rating, positions, is_active)
VALUES (
  'SEU_USER_ID_AQUI'::UUID,
  'MODALITY_ID'::UUID,
  8,
  '["Meio-campo", "Atacante"]'::jsonb,
  TRUE
)
RETURNING *;

-- ✅ Deve retornar relacionamento criado
```

#### Teste 1.2.2: Listar modalidades do atleta

```sql
-- Listar modalidades do atleta com detalhes
SELECT
  am.id,
  am.rating,
  am.positions,
  am.is_active,
  sm.name as modality_name,
  sm.icon,
  sm.color
FROM athlete_modalities am
INNER JOIN sport_modalities sm ON am.modality_id = sm.id
WHERE am.user_id = 'SEU_USER_ID_AQUI'::UUID
  AND am.is_active = TRUE
ORDER BY sm.name;

-- ✅ Deve retornar modalidades do atleta
```

#### Teste 1.2.3: Atualizar rating e posições

```sql
-- Atualizar rating e posições
UPDATE athlete_modalities
SET
  rating = 9,
  positions = '["Meio-campo"]'::jsonb
WHERE user_id = 'SEU_USER_ID_AQUI'::UUID
  AND modality_id = 'MODALITY_ID'::UUID
RETURNING *;

-- ✅ Deve retornar relacionamento atualizado
```

#### Teste 1.2.4: Listar atletas de uma modalidade

```sql
-- Listar atletas de uma modalidade
SELECT
  p.id,
  p.name,
  p.email,
  p.avatar_url,
  am.rating,
  am.positions,
  am.is_active
FROM athlete_modalities am
INNER JOIN profiles p ON am.user_id = p.id
WHERE am.modality_id = 'MODALITY_ID'::UUID
  AND am.is_active = TRUE
ORDER BY am.rating DESC, p.name;

-- ✅ Deve retornar atletas da modalidade ordenados por rating
```

#### Teste 1.2.5: Verificar constraint UNIQUE

```sql
-- Tentar criar relacionamento duplicado (deve falhar)
INSERT INTO athlete_modalities (user_id, modality_id, rating)
VALUES (
  'SEU_USER_ID_AQUI'::UUID,
  'MODALITY_ID'::UUID,
  7
);

-- ✅ Deve retornar erro: duplicate key value violates unique constraint
```

#### Teste 1.2.6: Verificar constraint de rating (1-10)

```sql
-- Tentar criar com rating inválido (deve falhar)
INSERT INTO athlete_modalities (user_id, modality_id, rating)
VALUES (
  'SEU_USER_ID_AQUI'::UUID,
  'OUTRA_MODALITY_ID'::UUID,
  11
);

-- ✅ Deve retornar erro: rating must be between 1 and 10
```

---

## 🌐 2. TESTES DE API

### 2.1 API de Modalidades

#### Teste 2.1.1: GET /api/modalities (listar)

```bash
# Listar modalidades do grupo
curl -X GET "http://localhost:3000/api/modalities?group_id=SEU_GROUP_ID" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "modalities": [
#     {
#       "id": "...",
#       "name": "Futebol 11",
#       "icon": "⚽",
#       "color": "#10B981",
#       "trainingsPerWeek": 3,
#       "athletesCount": 12,
#       "isActive": true
#     }
#   ]
# }
```

#### Teste 2.1.2: POST /api/modalities (criar)

```bash
# Criar modalidade
curl -X POST "http://localhost:3000/api/modalities" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "groupId": "SEU_GROUP_ID",
    "name": "Basquete",
    "icon": "🏀",
    "color": "#F97316",
    "trainingsPerWeek": 2,
    "description": "Basquete 3x3"
  }'

# ✅ Deve retornar:
# {
#   "modality": {
#     "id": "...",
#     "name": "Basquete",
#     "icon": "🏀",
#     ...
#   }
# }
```

#### Teste 2.1.3: POST /api/modalities (erro - não é admin)

```bash
# Tentar criar como membro (não admin)
curl -X POST "http://localhost:3000/api/modalities" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN_MEMBRO" \
  -d '{
    "groupId": "SEU_GROUP_ID",
    "name": "Vôlei"
  }'

# ✅ Deve retornar erro 403:
# {
#   "error": "Apenas administradores podem criar modalidades"
# }
```

#### Teste 2.1.4: GET /api/modalities/[id] (detalhes)

```bash
# Obter detalhes da modalidade
curl -X GET "http://localhost:3000/api/modalities/MODALITY_ID" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "modality": {
#     "id": "...",
#     "name": "Futebol 11",
#     "icon": "⚽",
#     "athletesCount": 12,
#     "positions": ["Goleiro", "Zagueiro", "Meio-campo", "Atacante"],
#     "athletes": [...]
#   }
# }
```

#### Teste 2.1.5: PATCH /api/modalities/[id] (atualizar)

```bash
# Atualizar modalidade
curl -X PATCH "http://localhost:3000/api/modalities/MODALITY_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "trainingsPerWeek": 4,
    "description": "Futebol 11 - 4 treinos semanais"
  }'

# ✅ Deve retornar modalidade atualizada
```

#### Teste 2.1.6: DELETE /api/modalities/[id] (excluir)

```bash
# Excluir modalidade (soft delete)
curl -X DELETE "http://localhost:3000/api/modalities/MODALITY_ID" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "success": true,
#   "message": "Modalidade excluída com sucesso"
# }

# Verificar que não aparece mais na listagem
curl -X GET "http://localhost:3000/api/modalities?group_id=SEU_GROUP_ID" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Modalidade excluída não deve aparecer
```

---

### 2.2 API de Posições

#### Teste 2.2.1: GET /api/modalities/[id]/positions

```bash
# Obter posições da modalidade
curl -X GET "http://localhost:3000/api/modalities/MODALITY_ID/positions" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "positions": ["Goleiro", "Zagueiro", "Meio-campo", "Atacante"]
# }
```

#### Teste 2.2.2: POST /api/modalities/[id]/positions (configurar)

```bash
# Configurar posições
curl -X POST "http://localhost:3000/api/modalities/MODALITY_ID/positions" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "positions": [
      "Goleiro",
      "Zagueiro",
      "Lateral",
      "Meio-campo",
      "Atacante"
    ]
  }'

# ✅ Deve retornar:
# {
#   "positions": ["Goleiro", "Zagueiro", ...]
# }
```

---

### 2.3 API de Atletas-Modalidades

#### Teste 2.3.1: GET /api/athletes/[userId]/modalities

```bash
# Listar modalidades do atleta
curl -X GET "http://localhost:3000/api/athletes/USER_ID/modalities?group_id=GROUP_ID" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "modalities": [
#     {
#       "id": "...",
#       "modality": {
#         "id": "...",
#         "name": "Futebol 11",
#         "icon": "⚽"
#       },
#       "rating": 8,
#       "positions": ["Meio-campo", "Atacante"],
#       "isActive": true
#     }
#   ]
# }
```

#### Teste 2.3.2: POST /api/athletes/[userId]/modalities (adicionar)

```bash
# Adicionar atleta a modalidade
curl -X POST "http://localhost:3000/api/athletes/USER_ID/modalities" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "modalityId": "MODALITY_ID",
    "rating": 7,
    "positions": ["Zagueiro"],
    "isActive": true
  }'

# ✅ Deve retornar relacionamento criado
```

#### Teste 2.3.3: POST (erro - modalidade duplicada)

```bash
# Tentar adicionar modalidade duplicada
curl -X POST "http://localhost:3000/api/athletes/USER_ID/modalities" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "modalityId": "MODALITY_ID",
    "rating": 8
  }'

# ✅ Deve retornar erro 400:
# {
#   "error": "Atleta já está vinculado a esta modalidade"
# }
```

#### Teste 2.3.4: PATCH /api/athletes/[userId]/modalities/[modalityId] (atualizar)

```bash
# Atualizar rating e posições
curl -X PATCH "http://localhost:3000/api/athletes/USER_ID/modalities/MODALITY_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "rating": 9,
    "positions": ["Meio-campo"]
  }'

# ✅ Deve retornar relacionamento atualizado
```

#### Teste 2.3.5: DELETE /api/athletes/[userId]/modalities/[modalityId] (remover)

```bash
# Remover atleta da modalidade
curl -X DELETE "http://localhost:3000/api/athletes/USER_ID/modalities/MODALITY_ID" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "success": true,
#   "message": "Atleta removido da modalidade"
# }
```

---

## 🎨 3. TESTES DE FRONTEND

### 3.1 Página Lista de Modalidades

#### Teste 3.1.1: Renderização inicial

1. Acessar `/modalidades`
2. Verificar:
   - ✅ Header com título "Modalidades"
   - ✅ Botão "Nova Modalidade" (se admin)
   - ✅ Grid de cards (3 colunas desktop)
   - ✅ Loading skeleton enquanto carrega
   - ✅ Cards aparecem após carregamento

#### Teste 3.1.2: Empty state

1. Criar grupo sem modalidades
2. Acessar `/modalidades`
3. Verificar:
   - ✅ Mensagem "Nenhuma modalidade criada"
   - ✅ Ilustração ou ícone
   - ✅ Botão "Criar Primeira Modalidade"

#### Teste 3.1.3: Criar modalidade

1. Clicar em "Nova Modalidade"
2. Preencher formulário:
   - Nome: "Futebol 11"
   - Ícone: ⚽
   - Cor: Verde
   - Treinos/semana: 3
3. Clicar em "Criar"
4. Verificar:
   - ✅ Toast de sucesso
   - ✅ Modal fechado
   - ✅ Nova modalidade aparece na lista
   - ✅ Dados corretos no card

---

### 3.2 Componente ModalityCard

#### Teste 3.2.1: Renderização

1. Verificar no card:
   - ✅ Ícone da modalidade (⚽)
   - ✅ Nome da modalidade
   - ✅ Contagem de atletas
   - ✅ Treinos por semana
   - ✅ Percentual de frequência
   - ✅ Botão "Ver Detalhes"
   - ✅ Menu de ações (...)

#### Teste 3.2.2: Ações

1. Clicar no menu (...)
2. Verificar opções:
   - ✅ Editar
   - ✅ Excluir
3. Clicar em "Editar"
4. Verificar:
   - ✅ Modal abre com dados preenchidos
5. Clicar em "Excluir"
6. Verificar:
   - ✅ Confirmação aparece
   - ✅ Ao confirmar, modalidade some da lista

---

### 3.3 Página Detalhes da Modalidade

#### Teste 3.3.1: Renderização

1. Clicar em "Ver Detalhes" de uma modalidade
2. Verificar:
   - ✅ Header com nome e ícone
   - ✅ Botão "Editar"
   - ✅ Seção de estatísticas (4 cards)
   - ✅ Lista de atletas
   - ✅ Botão "Adicionar Atleta"

#### Teste 3.3.2: Configurar posições

1. Na página de detalhes, encontrar "Posições"
2. Clicar em "Configurar Posições"
3. Adicionar posições:
   - Goleiro
   - Zagueiro
   - Meio-campo
   - Atacante
4. Clicar em "Salvar"
5. Verificar:
   - ✅ Toast de sucesso
   - ✅ Posições salvas aparecem

#### Teste 3.3.3: Lista de atletas

1. Verificar tabela de atletas:
   - ✅ Colunas: Avatar, Nome, Posições, Rating, Status
   - ✅ Ordenação por rating (padrão)
   - ✅ Botão editar por atleta

---

### 3.4 Página Lista de Atletas (Melhorada)

#### Teste 3.4.1: Renderização

1. Acessar `/atletas`
2. Verificar:
   - ✅ Header com filtros
   - ✅ Contador de atletas
   - ✅ Tabela com colunas corretas
   - ✅ Badges de modalidades
   - ✅ Frequência com cor (verde/amarelo/vermelho)

#### Teste 3.4.2: Filtros

**Busca:**
1. Digitar "João" no campo de busca
2. Verificar:
   - ✅ Debounce de 300ms
   - ✅ Filtro aplica corretamente
   - ✅ Apenas "João" aparece

**Filtro por Modalidade:**
1. Selecionar "Futebol" no dropdown
2. Verificar:
   - ✅ Apenas atletas com Futebol aparecem

**Filtro por Status:**
1. Selecionar "Ouro"
2. Verificar:
   - ✅ Apenas atletas Ouro aparecem

**Ordenação:**
1. Selecionar "Frequência (maior)"
2. Verificar:
   - ✅ Atletas ordenados por frequência decrescente

#### Teste 3.4.3: Resetar filtros

1. Aplicar múltiplos filtros
2. Clicar em "Resetar Filtros"
3. Verificar:
   - ✅ Todos os filtros resetados
   - ✅ Todos os atletas aparecem

---

### 3.5 Modal Editar Atleta

#### Teste 3.5.1: Abrir modal

1. Na lista de atletas, clicar em "Editar"
2. Verificar:
   - ✅ Modal abre
   - ✅ Informações básicas (readonly)
   - ✅ Lista de modalidades do atleta
   - ✅ Botão "Adicionar Modalidade"

#### Teste 3.5.2: Adicionar modalidade

1. Clicar em "Adicionar Modalidade"
2. Preencher:
   - Modalidade: Basquete
   - Posições: Armador
   - Rating: 7
3. Clicar em "Adicionar"
4. Verificar:
   - ✅ Toast de sucesso
   - ✅ Basquete aparece na lista
   - ✅ Badge de Basquete aparece na tabela principal

#### Teste 3.5.3: Editar rating

1. Na lista de modalidades do atleta, clicar em "Editar"
2. Alterar rating de 7 para 9
3. Alterar posição para "Ala"
4. Clicar em "Salvar"
5. Verificar:
   - ✅ Toast de sucesso
   - ✅ Dados atualizados

#### Teste 3.5.4: Remover modalidade

1. Clicar em "Remover" na modalidade
2. Confirmar exclusão
3. Verificar:
   - ✅ Modalidade removida da lista
   - ✅ Badge some da tabela principal

---

### 3.6 Componentes Visuais

#### Teste 3.6.1: ModalityBadge

1. Verificar badges de modalidades:
   - ✅ Ícone + nome
   - ✅ Cores customizadas
   - ✅ Max 3 visíveis
   - ✅ "+N" se houver mais
   - ✅ Tooltip com todas ao passar mouse

#### Teste 3.6.2: ModalityIcon

1. Verificar ícones:
   - ✅ Tamanhos corretos (sm, md, lg)
   - ✅ Cores customizadas
   - ✅ Fallback para ícone padrão

#### Teste 3.6.3: Rating Slider

1. No formulário, testar slider:
   - ✅ Valores 1-10
   - ✅ Indicador visual
   - ✅ Atualiza em tempo real

---

## 🔍 4. TESTES DE INTEGRAÇÃO

### 4.1 Fluxo Completo: Criar Modalidade + Adicionar Atletas

1. **Criar modalidade:**
   - Nome: "Futebol 11"
   - Ícone: ⚽
   - Treinos/semana: 3
   - ✅ Criada com sucesso

2. **Configurar posições:**
   - Goleiro, Zagueiro, Meio-campo, Atacante
   - ✅ Salvas com sucesso

3. **Adicionar atleta 1:**
   - Atleta: João
   - Posições: Goleiro
   - Rating: 9
   - ✅ Adicionado

4. **Adicionar atleta 2:**
   - Atleta: Maria
   - Posições: Meio-campo, Atacante
   - Rating: 8
   - ✅ Adicionada

5. **Adicionar atleta 3:**
   - Atleta: Pedro
   - Posições: Zagueiro
   - Rating: 7
   - ✅ Adicionado

6. **Verificar página de detalhes:**
   - ✅ Total atletas: 3
   - ✅ Lista mostra os 3 atletas
   - ✅ Ordenados por rating (João, Maria, Pedro)

---

### 4.2 Fluxo Completo: Atleta Multi-Modalidades

1. **Abrir modal de edição de atleta (João):**
   - ✅ Futebol 11 aparece na lista

2. **Adicionar Basquete:**
   - Modalidade: Basquete
   - Posições: Pivô
   - Rating: 6
   - ✅ Adicionado

3. **Adicionar Vôlei:**
   - Modalidade: Vôlei
   - Posições: Levantador
   - Rating: 7
   - ✅ Adicionado

4. **Verificar na lista de atletas:**
   - ✅ João tem 3 badges: [⚽ Futebol] [🏀 Basquete] [🏐 Vôlei]

5. **Editar rating do Basquete:**
   - Novo rating: 8
   - ✅ Atualizado

6. **Remover Vôlei:**
   - ✅ Removido
   - ✅ Badge de Vôlei some

---

### 4.3 Fluxo Completo: Filtros e Busca

1. **Criar cenário de teste:**
   - 3 modalidades: Futebol, Basquete, Vôlei
   - 5 atletas:
     - João: Futebol (9), Basquete (8)
     - Maria: Futebol (8), Vôlei (7)
     - Pedro: Basquete (7)
     - Ana: Vôlei (9)
     - Lucas: Futebol (6)

2. **Teste 1: Filtrar por Futebol:**
   - ✅ João, Maria, Lucas aparecem

3. **Teste 2: Filtrar por Basquete:**
   - ✅ João, Pedro aparecem

4. **Teste 3: Buscar "Maria":**
   - ✅ Apenas Maria aparece

5. **Teste 4: Ordenar por rating:**
   - ✅ João (9) > Maria/Pedro (8/7) > Lucas (6)

6. **Teste 5: Resetar:**
   - ✅ Todos os 5 atletas aparecem

---

## ✅ 5. CHECKLIST FINAL

### Backend
- [ ] GET /api/modalities funcionando
- [ ] POST /api/modalities funcionando
- [ ] GET /api/modalities/[id] funcionando
- [ ] PATCH /api/modalities/[id] funcionando
- [ ] DELETE /api/modalities/[id] funcionando
- [ ] GET /api/modalities/[id]/positions funcionando
- [ ] POST /api/modalities/[id]/positions funcionando
- [ ] GET /api/athletes/[userId]/modalities funcionando
- [ ] POST /api/athletes/[userId]/modalities funcionando
- [ ] PATCH /api/athletes/[userId]/modalities/[modalityId] funcionando
- [ ] DELETE /api/athletes/[userId]/modalities/[modalityId] funcionando
- [ ] Validações Zod funcionando
- [ ] Permissões verificadas
- [ ] Helpers testados

### Frontend
- [ ] Página /modalidades renderizando
- [ ] Página /modalidades/[id] renderizando
- [ ] Página /atletas melhorada
- [ ] ModalityCard renderizando
- [ ] ModalityForm validando
- [ ] ModalityModal funcionando
- [ ] PositionsConfig funcionando
- [ ] AthletesTable renderizando
- [ ] AthleteFilters funcionando
- [ ] EditAthleteModal funcionando
- [ ] ModalityBadge renderizando
- [ ] AddModalityModal funcionando
- [ ] EditRatingModal funcionando
- [ ] Loading states em todas as ações
- [ ] Error handling completo
- [ ] Toasts de feedback
- [ ] Responsivo (mobile/desktop)

### Integrações
- [ ] Fluxo de criar modalidade testado
- [ ] Fluxo de adicionar atletas testado
- [ ] Fluxo de multi-modalidades testado
- [ ] Filtros funcionando
- [ ] Busca funcionando
- [ ] Ordenação funcionando
- [ ] Permissões validadas

---

## 📝 6. RELATÓRIO DE TESTES

Após executar todos os testes, preencher:

```markdown
## Relatório de Testes - Fase 1

**Data:** __/__/____
**Testador:** _______________
**Ambiente:** Desenvolvimento / Produção

### Resumo

- **Total de testes:** 48
- **Testes executados:** __/48
- **Testes passaram:** __/48
- **Testes falharam:** __/48

### Falhas Encontradas

1. **Teste X.Y.Z:** Descrição da falha
   - **Esperado:** ...
   - **Obtido:** ...
   - **Ação:** ...

### Conclusão

[ ] ✅ FASE 1 100% VALIDADA - Pronto para produção
[ ] ⚠️ FASE 1 COM PENDÊNCIAS - Necessário correções
[ ] ❌ FASE 1 COM FALHAS CRÍTICAS - Necessário revisão
```

---

**Última atualização:** 2026-01-24
**Status:** 📋 Pronto para execução
**Tempo estimado:** 2-3 horas
