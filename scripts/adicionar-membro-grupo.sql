-- ============================================
-- ADICIONAR MEMBRO AO GRUPO "tESTE"
-- ============================================
-- Antes de testar athlete_modalities, precisamos de membros

-- ============================================
-- PASSO 1: Verificar se existem usuários
-- ============================================

SELECT
  id,
  full_name,
  code,
  platform_role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 📝 ANOTE um ID de usuário para adicionar ao grupo

-- ============================================
-- PASSO 2: Adicionar usuário ao grupo tESTE
-- ============================================
-- ⚠️ Substitua 'ID_DO_USUARIO_AQUI' por um ID do Passo 1

INSERT INTO group_members (
  group_id,
  user_id,
  role
)
VALUES (
  'ece94980-2440-4eed-9806-2363fb773134'::UUID,
  'ID_DO_USUARIO_AQUI'::UUID,
  'admin'  -- ou 'member' se preferir
)
RETURNING *;

-- ✅ SUCESSO: Se retornar o membro adicionado

-- ============================================
-- PASSO 3: Verificar se foi adicionado
-- ============================================

SELECT
  gm.id,
  gm.role,
  p.full_name,
  p.code,
  gm.joined_at
FROM group_members gm
INNER JOIN profiles p ON gm.user_id = p.id
WHERE gm.group_id = 'ece94980-2440-4eed-9806-2363fb773134'::UUID;

-- ✅ SUCESSO: Deve mostrar o membro adicionado

-- ============================================
-- AGORA você pode executar test-fase-1-executar.sql
-- ============================================
-- Use o user_id que você adicionou nos testes de athlete_modalities
