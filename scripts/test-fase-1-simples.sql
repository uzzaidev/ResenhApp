-- ============================================
-- VALIDAÇÃO FASE 1 - VERSÃO SIMPLIFICADA
-- ============================================
-- Testa APENAS modalidades (sem atletas)
-- Group: tESTE
-- Group ID: ece94980-2440-4eed-9806-2363fb773134
-- ============================================

-- ============================================
-- TESTE 1: Criar Modalidade "Futebol" ⚽
-- ============================================

INSERT INTO sport_modalities (
  group_id,
  name,
  icon,
  color,
  trainings_per_week
)
VALUES (
  'ece94980-2440-4eed-9806-2363fb773134'::UUID,
  'Futebol',
  '⚽',
  '#1ABC9C',
  3
)
RETURNING *;

-- ✅ SUCESSO: Se retornar 1 linha com os dados do Futebol
-- 📝 ANOTE o ID retornado para usar no próximo teste

-- ============================================
-- TESTE 2: Configurar Posições do Futebol
-- ============================================
-- ⚠️ Substitua 'ID_FUTEBOL_AQUI' pelo ID retornado no Teste 1

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
WHERE id = 'ID_FUTEBOL_AQUI'::UUID
RETURNING
  id,
  name,
  jsonb_array_length(positions) as total_positions,
  positions;

-- ✅ SUCESSO: Se total_positions = 8

-- ============================================
-- TESTE 3: Criar Modalidade "Basquete" 🏀
-- ============================================

INSERT INTO sport_modalities (
  group_id,
  name,
  icon,
  color,
  trainings_per_week
)
VALUES (
  'ece94980-2440-4eed-9806-2363fb773134'::UUID,
  'Basquete',
  '🏀',
  '#E67E22',
  2
)
RETURNING *;

-- ✅ SUCESSO: Se retornar os dados do Basquete

-- ============================================
-- TESTE 4: Criar Modalidade "Vôlei" 🏐
-- ============================================

INSERT INTO sport_modalities (
  group_id,
  name,
  icon,
  color,
  trainings_per_week
)
VALUES (
  'ece94980-2440-4eed-9806-2363fb773134'::UUID,
  'Vôlei',
  '🏐',
  '#3498DB',
  2
)
RETURNING *;

-- ✅ SUCESSO: Se retornar os dados do Vôlei

-- ============================================
-- TESTE 5: Listar Todas as Modalidades
-- ============================================

SELECT
  id,
  name,
  icon,
  color,
  trainings_per_week,
  jsonb_array_length(positions) as total_positions,
  created_at
FROM sport_modalities
WHERE group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID
ORDER BY name;

-- ✅ SUCESSO: Deve retornar 3 modalidades
-- ✅ Futebol deve ter total_positions = 8
-- ✅ Basquete e Vôlei devem ter null (sem posições configuradas)

-- ============================================
-- TESTE 6: Atualizar Modalidade Basquete
-- ============================================
-- Vamos configurar as posições do Basquete
-- ⚠️ Substitua 'ID_BASQUETE_AQUI' pelo ID retornado no Teste 3

UPDATE sport_modalities
SET
  positions = '["Armador", "Ala-Armador", "Ala", "Ala-Pivô", "Pivô"]'::jsonb,
  trainings_per_week = 3
WHERE id = 'ID_BASQUETE_AQUI'::UUID
RETURNING
  id,
  name,
  trainings_per_week,
  jsonb_array_length(positions) as total_positions;

-- ✅ SUCESSO: trainings_per_week = 3, total_positions = 5

-- ============================================
-- TESTE 7: Buscar Modalidade Específica
-- ============================================

SELECT *
FROM sport_modalities
WHERE name = 'Futebol'
  AND group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID;

-- ✅ SUCESSO: Retorna apenas o Futebol

-- ============================================
-- TESTE 8: Contar Modalidades do Grupo
-- ============================================

SELECT
  COUNT(*) as total_modalities,
  COUNT(*) FILTER (WHERE positions IS NOT NULL AND jsonb_array_length(positions) > 0) as with_positions,
  SUM(trainings_per_week) as total_trainings_week
FROM sport_modalities
WHERE group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID;

-- ✅ SUCESSO:
-- total_modalities = 3
-- with_positions = 2 (Futebol e Basquete)
-- total_trainings_week = 8 (3 + 3 + 2)

-- ============================================
-- TESTE 9: Verificar Constraint UNIQUE
-- ============================================
-- Tentar criar outra modalidade "Futebol" (deve falhar)

INSERT INTO sport_modalities (
  group_id,
  name,
  icon,
  color
)
VALUES (
  'ece94980-2440-4eed-9806-2363fb773134'::UUID,
  'Futebol',
  '⚽',
  '#FF0000'
);

-- ❌ ESPERADO: ERRO duplicate key value violates unique constraint
-- ✅ Se der erro, significa que UNIQUE(group_id, name) está funcionando!

-- ============================================
-- TESTE 10: Deletar Modalidade Vôlei
-- ============================================
-- ⚠️ Substitua 'ID_VOLEI_AQUI' pelo ID retornado no Teste 4

DELETE FROM sport_modalities
WHERE id = 'ID_VOLEI_AQUI'::UUID
RETURNING id, name;

-- ✅ SUCESSO: Retorna os dados do Vôlei deletado

-- ============================================
-- TESTE 11: Verificar Deleção
-- ============================================

SELECT
  COUNT(*) as total_remaining
FROM sport_modalities
WHERE group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID;

-- ✅ SUCESSO: total_remaining = 2 (apenas Futebol e Basquete)

-- ============================================
-- TESTE 12: Listar Posições de uma Modalidade
-- ============================================

SELECT
  name,
  positions,
  positions->0 as primeira_posicao,
  positions->-1 as ultima_posicao
FROM sport_modalities
WHERE id = 'ID_FUTEBOL_AQUI'::UUID;

-- ✅ SUCESSO:
-- primeira_posicao = "Goleiro"
-- ultima_posicao = "Ponta"

-- ============================================
-- 🎉 RESULTADO
-- ============================================
/*
SE TODOS OS TESTES PASSARAM (exceto Teste 9 que deve falhar):
✅ Backend de Modalidades está FUNCIONANDO
✅ Tabela sport_modalities OK
✅ CRUD completo funcional
✅ JSONB positions funcionando
✅ Constraints UNIQUE funcionando
✅ Migrations aplicadas corretamente

PRÓXIMO PASSO:
Para testar athlete_modalities, você precisa:
1. Ter usuários cadastrados
2. Adicioná-los como membros do grupo
*/

-- ============================================
-- LIMPEZA (Opcional)
-- ============================================

/*
DELETE FROM sport_modalities
WHERE group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID;

SELECT COUNT(*) FROM sport_modalities
WHERE group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID;
-- Deve retornar 0
*/
