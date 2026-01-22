# 🗄️ Configuração de Storage e Realtime - ResenhApp V2.0

**Guia Passo a Passo para Configurar Storage Buckets e Realtime no Supabase**

---

## 📋 PRÉ-REQUISITOS

- ✅ Projeto Supabase criado
- ✅ 8 migrations aplicadas com sucesso
- ✅ Acesso ao Supabase Dashboard

---

## 🎯 OBJETIVO

Configurar:
1. **4 Storage Buckets** (avatars, group-photos, venue-photos, receipts)
2. **Políticas de Acesso** para cada bucket
3. **Realtime habilitado** em 6 tabelas (events, event_attendance, event_actions, notifications, teams, team_members)

---

## 🚀 MÉTODO RÁPIDO (RECOMENDADO)

### Opção A: Script SQL Consolidado

1. **Acessar SQL Editor:**
   - Ir em: https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new

2. **Executar Script:**
   - Abrir arquivo: `supabase/setup_storage_and_realtime.sql`
   - Copiar todo o conteúdo
   - Colar no SQL Editor
   - Executar (Run)

3. **Verificar Resultados:**
   - O script inclui queries de verificação no final
   - Deve mostrar:
     - 4 buckets criados
     - 10+ políticas criadas
     - 6 tabelas com Realtime habilitado

---

## 📝 MÉTODO MANUAL (PASSO A PASSO)

### 1. Criar Storage Buckets

**Via Dashboard:**

1. Ir em `Storage` → `Buckets`
2. Clicar em `New bucket`
3. Criar cada bucket:

| Bucket | Nome | Public | File Size Limit | MIME Types |
|--------|------|--------|-----------------|------------|
| `avatars` | avatars | ✅ Sim | 2 MB | image/jpeg, image/png, image/webp |
| `group-photos` | group-photos | ✅ Sim | 5 MB | image/jpeg, image/png, image/webp |
| `venue-photos` | venue-photos | ✅ Sim | 5 MB | image/jpeg, image/png, image/webp |
| `receipts` | receipts | ❌ Não | 10 MB | image/jpeg, image/png, application/pdf |

**Via SQL (Alternativa):**

```sql
-- Executar no SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('group-photos', 'group-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('venue-photos', 'venue-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('receipts', 'receipts', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']);
```

---

### 2. Configurar Políticas de Storage

**Via SQL Editor (Recomendado):**

Execute as políticas do arquivo `supabase/setup_storage_and_realtime.sql` (seções 2-5).

**Via Dashboard (Alternativa):**

1. Ir em `Storage` → `Policies`
2. Para cada bucket, adicionar políticas manualmente
3. Usar as políticas SQL como referência

---

### 3. Habilitar Realtime

**Via Dashboard:**

1. Ir em `Database` → `Replication`
2. Para cada tabela abaixo, clicar e marcar `Enable Realtime`:
   - ✅ `events`
   - ✅ `event_attendance`
   - ✅ `event_actions`
   - ✅ `notifications`
   - ✅ `teams`
   - ✅ `team_members`

**Via SQL (Alternativa):**

```sql
-- Executar no SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE event_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
```

---

## ✅ VERIFICAÇÃO

### Verificar Buckets

```sql
SELECT 
  id AS bucket_id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE id IN ('avatars', 'group-photos', 'venue-photos', 'receipts')
ORDER BY id;
```

**Resultado esperado:** 4 buckets listados

---

### Verificar Políticas

```sql
SELECT 
  policyname,
  cmd AS operacao,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;
```

**Resultado esperado:** 10+ políticas listadas

---

### Verificar Realtime

```sql
SELECT 
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('events', 'event_attendance', 'event_actions', 'notifications', 'teams', 'team_members')
ORDER BY tablename;
```

**Resultado esperado:** 6 tabelas listadas

---

## 🧪 TESTE RÁPIDO

### Testar Upload de Avatar

1. Ir em `Storage` → `avatars`
2. Clicar em `Upload file`
3. Selecionar uma imagem
4. Upload deve funcionar (se autenticado)

### Testar Realtime

```typescript
// No console do navegador (após configurar cliente Supabase)
const supabase = createClient(url, key);

const channel = supabase
  .channel('test-realtime')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'events'
  }, (payload) => {
    console.log('Realtime update:', payload);
  })
  .subscribe();

// Criar/atualizar um evento no dashboard
// Deve aparecer no console
```

---

## 📚 REFERÊNCIAS

- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **Supabase Realtime Docs:** https://supabase.com/docs/guides/realtime
- **Storage Policies:** https://supabase.com/docs/guides/storage/security/access-control

---

## 🐛 TROUBLESHOOTING

### Erro: "bucket already exists"
- ✅ Normal se já foi criado anteriormente
- O script usa `ON CONFLICT DO NOTHING` para evitar erros

### Erro: "policy already exists"
- ✅ Normal se já foi criada anteriormente
- Execute: `DROP POLICY IF EXISTS "policy_name" ON storage.objects;` antes de recriar

### Realtime não funciona
- Verificar se a tabela está na publicação: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
- Verificar se `REPLICA IDENTITY` está configurado (já está nas migrations)

---

## ✅ CHECKLIST FINAL

- [ ] 4 buckets criados (avatars, group-photos, venue-photos, receipts)
- [ ] Políticas de Storage configuradas (10+ políticas)
- [ ] Realtime habilitado em 6 tabelas
- [ ] Teste de upload funcionando
- [ ] Verificação SQL executada com sucesso

---

**Próximo Passo:** Configurar Auth Providers (Email/Password)

