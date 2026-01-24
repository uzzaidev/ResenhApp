-- ============================================
-- VALIDAÇÃO FASE 1 - PRONTO PARA EXECUTAR
-- ============================================
-- Group: tESTE
-- Group ID: ece94980-2440-4eed-9806-2363fb773134
-- ============================================

-- ============================================
-- PASSO 0: Descobrir seu User ID
-- ============================================
-- Execute isso primeiro para pegar um user_id válido

SELECT
  p.id,
  p.full_name,
  p.code,
  au.email,
  gm.role as group_role
FROM profiles p
INNER JOIN group_members gm ON p.id = gm.user_id
LEFT JOIN auth.users au ON p.id = au.id
WHERE gm.group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID
LIMIT 5;

-- 📝 ANOTE um dos IDs retornados acima
-- Você vai usar esse ID nos testes 5, 6, 7, 8, 10 e 11
-- Substitua 'SEU_USER_ID_AQUI' por esse ID

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
RETURNING
  id,
  name,
  icon,
  color,
  trainings_per_week,
  created_at;

-- ✅ SUCESSO: Se retornar 1 linha com os dados do Futebol
-- 📝 ANOTE o ID retornado - você vai precisar nos próximos testes
-- Exemplo: id = '12345678-1234-1234-1234-123456789abc'

-- ============================================
-- TESTE 2: Configurar Posições do Futebol
-- ============================================
-- ⚠️ IMPORTANTE: Substitua 'ID_FUTEBOL_AQUI' pelo ID retornado no Teste 1

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

-- ✅ SUCESSO: Se retornar total_positions = 8

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
RETURNING
  id,
  name,
  icon,
  color;

-- ✅ SUCESSO: Se retornar os dados do Basquete
-- 📝 ANOTE o ID retornado - você vai precisar no Teste 6

-- ============================================
-- TESTE 4: Listar Modalidades do Grupo
-- ============================================

SELECT
  sm.id,
  sm.name,
  sm.icon,
  sm.color,
  sm.trainings_per_week,
  jsonb_array_length(sm.positions) as total_positions,
  COUNT(DISTINCT am.user_id) as athlete_count
FROM sport_modalities sm
LEFT JOIN athlete_modalities am ON am.modality_id = sm.id
WHERE sm.group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID
GROUP BY sm.id, sm.name, sm.icon, sm.color, sm.trainings_per_week, sm.positions
ORDER BY sm.name;

-- ✅ SUCESSO: Deve retornar 2 linhas (Basquete e Futebol)
-- ✅ Futebol deve ter total_positions = 8
-- ✅ athlete_count = 0 para ambas (ainda sem atletas)

-- ============================================
-- TESTE 5: Adicionar Atleta ao Futebol
-- ============================================
-- ⚠️ Substitua:
-- - 'SEU_USER_ID_AQUI' pelo ID retornado no PASSO 0
-- - 'ID_FUTEBOL_AQUI' pelo ID retornado no Teste 1

INSERT INTO athlete_modalities (
  user_id,
  modality_id,
  rating,
  positions
)
VALUES (
  'SEU_USER_ID_AQUI'::UUID,
  'ID_FUTEBOL_AQUI'::UUID,
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

-- ✅ SUCESSO: Se retornar o vínculo com rating = 8

-- ============================================
-- TESTE 6: Adicionar Atleta ao Basquete
-- ============================================
-- ⚠️ Substitua:
-- - 'SEU_USER_ID_AQUI' pelo mesmo ID do Teste 5
-- - 'ID_BASQUETE_AQUI' pelo ID retornado no Teste 3

INSERT INTO athlete_modalities (
  user_id,
  modality_id,
  rating,
  positions
)
VALUES (
  'SEU_USER_ID_AQUI'::UUID,
  'ID_BASQUETE_AQUI'::UUID,
  7,
  '["Armador", "Ala"]'::jsonb
)
RETURNING
  id,
  rating,
  positions;

-- ✅ SUCESSO: Atleta agora tem 2 modalidades!

-- ============================================
-- TESTE 7: Listar Modalidades do Atleta
-- ============================================
-- ⚠️ Substitua 'SEU_USER_ID_AQUI' pelo mesmo ID usado antes

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

-- ✅ SUCESSO: Deve retornar 2 linhas
-- ✅ Basquete: rating = 7, positions = ["Armador", "Ala"]
-- ✅ Futebol: rating = 8, positions = ["Atacante", "Meia"]

-- ============================================
-- TESTE 8: Atualizar Rating do Futebol
-- ============================================
-- Vamos aumentar o rating do Futebol de 8 para 9

UPDATE athlete_modalities
SET rating = 9
WHERE user_id = 'SEU_USER_ID_AQUI'::UUID
  AND modality_id = 'ID_FUTEBOL_AQUI'::UUID
RETURNING
  id,
  rating,
  updated_at;

-- ✅ SUCESSO: rating = 9

-- ============================================
-- TESTE 9: Verificar Atualização e Contagem
-- ============================================

SELECT
  sm.id,
  sm.name,
  sm.icon,
  COUNT(DISTINCT am.user_id) as athlete_count,
  ROUND(AVG(am.rating), 1) as avg_rating
FROM sport_modalities sm
LEFT JOIN athlete_modalities am ON am.modality_id = sm.id
WHERE sm.group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID
GROUP BY sm.id, sm.name, sm.icon
ORDER BY sm.name;

-- ✅ SUCESSO:
-- ✅ Basquete: athlete_count = 1, avg_rating = 7.0
-- ✅ Futebol: athlete_count = 1, avg_rating = 9.0

-- ============================================
-- TESTE 10: Remover Atleta do Basquete
-- ============================================

DELETE FROM athlete_modalities
WHERE user_id = 'SEU_USER_ID_AQUI'::UUID
  AND modality_id = 'ID_BASQUETE_AQUI'::UUID
RETURNING id, modality_id;

-- ✅ SUCESSO: Retorna 1 linha deletada

-- ============================================
-- TESTE 11: Verificar que ficou só no Futebol
-- ============================================

SELECT
  am.id,
  sm.name as modality_name,
  sm.icon,
  am.rating,
  am.positions
FROM athlete_modalities am
INNER JOIN sport_modalities sm ON am.modality_id = sm.id
WHERE am.user_id = 'SEU_USER_ID_AQUI'::UUID;

-- ✅ SUCESSO: Deve retornar apenas 1 linha (Futebol)
-- ✅ rating = 9

-- ============================================
-- TESTE 12: Verificar Posições Configuradas
-- ============================================

SELECT
  name,
  positions,
  jsonb_array_length(positions) as total_positions
FROM sport_modalities
WHERE id = 'ID_FUTEBOL_AQUI'::UUID;

-- ✅ SUCESSO: total_positions = 8
-- ✅ positions deve conter array com 8 posições

-- ============================================
-- 🎉 PARABÉNS!
-- ============================================
-- Se chegou até aqui com todos os testes passando:
-- ✅ Backend da Fase 1 está 100% FUNCIONAL
-- ✅ Migrations aplicadas corretamente
-- ✅ Modalidades funcionando
-- ✅ Multi-modalidades funcionando
-- ✅ JSONB positions funcionando
-- ✅ Relacionamentos OK
-- ✅ CRUD completo testado

-- ============================================
-- LIMPEZA (Opcional)
-- ============================================
-- Execute apenas se quiser remover os dados de teste

/*
-- Deletar vínculos
DELETE FROM athlete_modalities
WHERE modality_id IN (
  SELECT id FROM sport_modalities
  WHERE name IN ('Futebol', 'Basquete')
  AND group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID
);

-- Deletar modalidades
DELETE FROM sport_modalities
WHERE name IN ('Futebol', 'Basquete')
AND group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID;

-- Verificar limpeza
SELECT * FROM sport_modalities
WHERE group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID;
*/
