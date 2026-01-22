# 🧪 Teste Local de Autenticação - ResenhApp V2.0

**Guia Rápido para Testar Auth Localmente**

---

## 🎯 OBJETIVO

Testar autenticação (cadastro, login, reset password) localmente antes de configurar produção no Cloudflare.

---

## ⚙️ CONFIGURAÇÃO NO SUPABASE (PARA DEV LOCAL)

### 1. Configurar Site URL

**Ir em:** `Authentication` → `URL Configuration`

**Site URL (para desenvolvimento):**
```
http://localhost:3000
```

### 2. Configurar Redirect URLs

**Adicionar estas URLs (uma por linha):**
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/verify-email
```

**⚠️ IMPORTANTE:**
- Essas URLs são apenas para desenvolvimento local
- Quando for para produção, você vai adicionar as URLs do Cloudflare
- O Supabase permite múltiplas URLs (dev + prod)

---

## 🚀 TESTE RÁPIDO (SEM NEXT.JS)

### Opção 1: Usar arquivo HTML de teste

1. **Abrir `test-auth.html` no navegador:**
   - Duplo clique no arquivo, ou
   - Arrastar para o navegador

2. **Testar fluxos:**
   - ✅ Cadastro (Sign Up)
   - ✅ Login (Sign In)
   - ✅ Reset Password
   - ✅ Logout

### Opção 2: Servir via HTTP local

```bash
# No PowerShell (Windows)
cd "C:\Projetos Uzz.Ai\peladeiros-main"
python -m http.server 8000

# Ou usar npx serve
npx serve -p 8000
```

**Acessar:** http://localhost:8000/test-auth.html

---

## 🔧 CONFIGURAÇÃO PARA DESENVOLVIMENTO LOCAL

### Email Confirmations (Opcional)

**Para desenvolvimento rápido, você pode desabilitar:**

1. Ir em: `Authentication` → `Settings` → `Email`
2. Desmarcar: **"Enable Email Confirmations"**
3. Salvar

**Vantagem:** Não precisa verificar email após cadastro (mais rápido para testar)

**Desvantagem:** Não testa o fluxo completo de confirmação

**Recomendação:** Deixar habilitado para testar o fluxo completo

---

## 📧 TESTAR ENVIO DE EMAILS

### Verificar se emails estão sendo enviados

1. **Ir em:** `Authentication` → `Logs`
2. Verificar logs de:
   - Sign Up
   - Password Reset
   - Email Confirmation

### Verificar caixa de entrada

- Verificar pasta de **Spam/Lixo Eletrônico**
- Emails do Supabase podem ir para spam inicialmente
- Adicionar remetente aos contatos

---

## 🧪 TESTE PASSO A PASSO

### 1. Testar Cadastro

1. Abrir `test-auth.html`
2. Preencher:
   - Email: `teste@exemplo.com`
   - Senha: `senha123`
   - Nome: `Teste Usuario`
3. Clicar em "Cadastrar"
4. **Se Email Confirmations estiver habilitado:**
   - Verificar email
   - Clicar no link de confirmação
5. **Se estiver desabilitado:**
   - Login automático após cadastro

### 2. Testar Login

1. Preencher email e senha
2. Clicar em "Entrar"
3. Deve mostrar informações do usuário

### 3. Testar Reset Password

1. Clicar em "Esqueci minha senha"
2. Inserir email
3. Verificar email recebido
4. Clicar no link
5. Redefinir senha

### 4. Verificar no Supabase Dashboard

1. Ir em: `Authentication` → `Users`
2. Verificar se usuário foi criado
3. Verificar se email está confirmado

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Checklist de Verificação

- [ ] Site URL configurado: `http://localhost:3000`
- [ ] 3 Redirect URLs adicionadas
- [ ] Email/Password provider habilitado
- [ ] Teste de cadastro funcionando
- [ ] Teste de login funcionando
- [ ] Emails sendo enviados (verificar logs)
- [ ] Usuário aparece em `Authentication` → `Users`

---

## 🐛 TROUBLESHOOTING LOCAL

### Erro: "Invalid redirect URL"

**Causa:** URL não está na lista de Redirect URLs permitidas

**Solução:**
1. Verificar se adicionou `http://localhost:3000/auth/callback`
2. Verificar se não tem barra no final
3. Verificar se está usando `http://` e não `https://`

### Email não chega

**Causas possíveis:**
1. Email Confirmations desabilitado (verificar Settings)
2. Email em spam
3. Rate limit atingido (aguardar 1 hora)

**Solução:**
- Verificar `Authentication` → `Logs`
- Verificar pasta de spam
- Tentar com outro email

### "Email already registered"

**Causa:** Usuário já existe

**Solução:**
- Fazer login em vez de cadastro
- Ou deletar usuário em `Authentication` → `Users`

---

## 📝 NOTAS IMPORTANTES

### URLs para Desenvolvimento vs Produção

**Desenvolvimento (agora):**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/*`

**Produção (futuro - Cloudflare):**
- Site URL: `https://resenhapp.com`
- Redirect URLs: `https://resenhapp.com/*`

**⚠️ Você pode ter AMBAS configuradas ao mesmo tempo!**
- Supabase aceita múltiplas URLs
- Use localhost para dev
- Use Cloudflare URLs para prod

---

## 🚀 PRÓXIMOS PASSOS

Após testar localmente:

1. **Configurar Next.js:**
   - Criar cliente Supabase
   - Criar páginas de auth
   - Integrar com middleware

2. **Configurar Cloudflare (produção):**
   - Adicionar URLs de produção
   - Configurar domínio
   - Testar em staging

---

**Documento criado:** 2026-01-27
**Última atualização:** 2026-01-27

