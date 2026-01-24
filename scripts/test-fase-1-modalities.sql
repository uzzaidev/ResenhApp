-- ============================================
-- SCRIPT DE VALIDAÇÃO - FASE 1: MODALIDADES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Substitua SEU_GROUP_ID e SEU_USER_ID pelos valores reais

-- ============================================
-- INSTRUÇÕES:
-- 1. Execute cada bloco separadamente
-- 2. Copie os IDs retornados para usar nos próximos blocos
-- 3. Substitua os placeholders pelos IDs reais
-- ============================================

-- ============================================
-- TESTE 1: Criar Modalidade "Futebol"
-- ============================================
-- Substitua 'SEU_GROUP_ID_AQUI' pelo UUID do seu grupo

INSERT INTO sport_modalities (
  group_id,
  name,
  icon,
  color,
  trainings_per_week
)
VALUES (
  'SEU_GROUP_ID_AQUI'::UUID,
  'Futebol',
  '⚽',
  '#1ABC9C',
  3
)
RETURNING
  id,
  name,
  icon,
  color,
  trainings_per_week,
  created_at;

-- ✅ SUCESSO: Se retornar 1 linha com todos os campos preenchidos
-- 📝 ANOTE o ID retornado - você vai usar nos próximos testes

-- ============================================
-- TESTE 2: Configurar Posições do Futebol
-- ============================================
-- Substitua 'ID_DA_MODALIDADE_FUTEBOL' pelo ID retornado no Teste 1

UPDATE sport_modalities
SET positions = '[
  "Goleiro",
  "Zagueiro",
  "Lateral Direito",
  "Lateral Esquerdo",
  "Volante",
  "Meia",
  "Atacante",
  "Ponta"
]'::jsonb
WHERE id = 'ID_DA_MODALIDADE_FUTEBOL'::UUID
RETURNING
  id,
  name,
  positions;

-- ✅ SUCESSO: Se retornar a modalidade com array de 8 posições

-- ============================================
-- TESTE 3: Criar Modalidade "Basquete"
-- ============================================

INSERT INTO sport_modalities (
  group_id,
  name,
  icon,
  color,
  trainings_per_week
)
VALUES (
  'SEU_GROUP_ID_AQUI'::UUID,
  'Basquete',
  '🏀',
  '#E67E22',
  2
)
RETURNING
  id,
  name,
  icon;

-- ✅ SUCESSO: Se retornar a segunda modalidade
-- 📝 ANOTE o ID retornado - você vai usar nos próximos testes

-- ============================================
-- TESTE 4: Listar Modalidades do Grupo
-- ============================================

SELECT
  sm.id,
  sm.name,
  sm.icon,
  sm.color,
  sm.trainings_per_week,
  sm.positions,
  COUNT(DISTINCT am.user_id) as athlete_count
FROM sport_modalities sm
LEFT JOIN athlete_modalities am ON am.modality_id = sm.id
WHERE sm.group_id = 'SEU_GROUP_ID_AQUI'::UUID
GROUP BY sm.id
ORDER BY sm.name;

-- ✅ SUCESSO: Deve retornar 2 modalidades (Basquete e Futebol)
-- ✅ athlete_count deve ser 0 para ambas (ainda sem atletas)

-- ============================================
-- TESTE 5: Adicionar Atleta ao Futebol
-- ============================================
-- Substitua:
-- - SEU_USER_ID_AQUI: ID do usuário/atleta
-- - ID_DA_MODALIDADE_FUTEBOL: ID retornado no Teste 1

INSERT INTO athlete_modalities (
  user_id,
  modality_id,
  rating,
  positions
)
VALUES (
  'SEU_USER_ID_AQUI'::UUID,
  'ID_DA_MODALIDADE_FUTEBOL'::UUID,
  8,
  '["Atacante", "Meia"]'::jsonb
)
RETURNING
  id,
  user_id,
  modality_id,
  rating,
  positions,
  created_at;

-- ✅ SUCESSO: Se retornar o vínculo criado com rating 8

-- ============================================
-- TESTE 6: Adicionar Atleta ao Basquete
-- ============================================
-- Substitua ID_DA_MODALIDADE_BASQUETE pelo ID retornado no Teste 3

INSERT INTO athlete_modalities (
  user_id,
  modality_id,
  rating,
  positions
)
VALUES (
  'SEU_USER_ID_AQUI'::UUID,
  'ID_DA_MODALIDADE_BASQUETE'::UUID,
  7,
  '["Armador", "Ala"]'::jsonb
)
RETURNING
  id,
  rating,
  positions;

-- ✅ SUCESSO: Atleta agora vinculado a 2 modalidades

-- ============================================
-- TESTE 7: Listar Modalidades do Atleta
-- ============================================

SELECT
  am.id,
  am.rating,
  am.positions,
  sm.name as modality_name,
  sm.icon as modality_icon,
  sm.color as modality_color,
  am.created_at
FROM athlete_modalities am
INNER JOIN sport_modalities sm ON am.modality_id = sm.id
WHERE am.user_id = 'SEU_USER_ID_AQUI'::UUID
ORDER BY sm.name;

-- ✅ SUCESSO: Deve retornar 2 registros
-- ✅ Basquete: rating = 7
-- ✅ Futebol: rating = 8

-- ============================================
-- TESTE 8: Atualizar Rating do Futebol
-- ============================================

UPDATE athlete_modalities
SET rating = 9
WHERE user_id = 'SEU_USER_ID_AQUI'::UUID
  AND modality_id = 'ID_DA_MODALIDADE_FUTEBOL'::UUID
RETURNING
  id,
  rating,
  updated_at;

-- ✅ SUCESSO: Rating atualizado para 9

-- ============================================
-- TESTE 9: Listar Modalidades com Contagem
-- ============================================

SELECT
  sm.id,
  sm.name,
  sm.icon,
  sm.trainings_per_week,
  COUNT(DISTINCT am.user_id) as athlete_count
FROM sport_modalities sm
LEFT JOIN athlete_modalities am ON am.modality_id = sm.id
WHERE sm.group_id = 'SEU_GROUP_ID_AQUI'::UUID
GROUP BY sm.id
ORDER BY sm.name;

-- ✅ SUCESSO: Ambas modalidades devem ter athlete_count = 1

-- ============================================
-- TESTE 10: Remover Atleta do Basquete
-- ============================================

DELETE FROM athlete_modalities
WHERE user_id = 'SEU_USER_ID_AQUI'::UUID
  AND modality_id = 'ID_DA_MODALIDADE_BASQUETE'::UUID
RETURNING id;

-- ✅ SUCESSO: 1 registro deletado

-- ============================================
-- TESTE 11: Verificar Remoção
-- ============================================

SELECT
  am.id,
  sm.name as modality_name,
  am.rating
FROM athlete_modalities am
INNER JOIN sport_modalities sm ON am.modality_id = sm.id
WHERE am.user_id = 'SEU_USER_ID_AQUI'::UUID;

-- ✅ SUCESSO: Retorna apenas 1 registro (Futebol)

-- ============================================
-- TESTE 12: Listar Posições da Modalidade
-- ============================================

SELECT
  name,
  positions,
  jsonb_array_length(positions) as total_positions
FROM sport_modalities
WHERE id = 'ID_DA_MODALIDADE_FUTEBOL'::UUID;

-- ✅ SUCESSO: Deve retornar 8 posições configuradas

-- ============================================
-- LIMPEZA (Opcional)
-- ============================================
-- Execute isso para limpar os dados de teste

/*
-- Deletar vínculos de atletas
DELETE FROM athlete_modalities
WHERE modality_id IN (
  SELECT id FROM sport_modalities
  WHERE name IN ('Futebol', 'Basquete')
  AND group_id = 'SEU_GROUP_ID_AQUI'::UUID
);

-- Deletar modalidades
DELETE FROM sport_modalities
WHERE name IN ('Futebol', 'Basquete')
AND group_id = 'SEU_GROUP_ID_AQUI'::UUID;
*/

-- ============================================
-- RESUMO DE VALIDAÇÃO
-- ============================================
/*
✅ Teste 1:  Criar modalidade Futebol
✅ Teste 2:  Configurar 8 posições
✅ Teste 3:  Criar modalidade Basquete
✅ Teste 4:  Listar 2 modalidades do grupo
✅ Teste 5:  Vincular atleta ao Futebol
✅ Teste 6:  Vincular atleta ao Basquete (multi-modalidades)
✅ Teste 7:  Listar 2 modalidades do atleta
✅ Teste 8:  Atualizar rating para 9
✅ Teste 9:  Verificar contagem de atletas
✅ Teste 10: Remover atleta do Basquete
✅ Teste 11: Verificar remoção funcionou
✅ Teste 12: Verificar posições configuradas

SE TODOS OS 12 TESTES PASSAREM:
✅ Backend da Fase 1 está 100% funcional!
✅ Migrations aplicadas corretamente
✅ Relacionamentos funcionando
✅ JSONB positions funcionando
✅ Frontend também funcionará (usa essas mesmas queries)
*/
