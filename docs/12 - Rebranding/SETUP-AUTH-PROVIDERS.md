# 🔐 Configuração de Auth Providers - ResenhApp V2.0

**Guia Completo para Configurar Autenticação no Supabase**

---

## 📋 PRÉ-REQUISITOS

- ✅ Projeto Supabase criado
- ✅ Credenciais configuradas
- ✅ Migrations aplicadas

---

## 🎯 OBJETIVO

Configurar:
1. **Email/Password** (Provider principal)
2. **Templates de Email** (Confirmação, Reset, etc.)
3. **Site URL e Redirect URLs**
4. **Teste Local** (Next.js dev server)

---

## 🚀 PASSO 1: CONFIGURAR EMAIL/PASSWORD

### 1.1 Acessar Configurações de Auth

1. **Ir no Supabase Dashboard:**
   - Acesse: https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/auth/providers

2. **Verificar Email Provider:**
   - O Email provider já deve estar habilitado por padrão
   - Se não estiver, clique em "Enable Email Provider"

### 1.2 Configurações de Email

**Ir em:** `Authentication` → `Settings` → `Email`

**Configurações importantes:**

- ✅ **Enable Email Signup:** Habilitado (usuários podem se registrar)
- ✅ **Enable Email Confirmations:** **HABILITAR** (recomendado para produção)
  - ⚠️ **Para desenvolvimento local:** Pode desabilitar temporariamente
- ✅ **Secure Email Change:** Habilitado
- ✅ **Double Confirm Email Changes:** Habilitado (segurança extra)

**Configurações de Rate Limiting:**
- **Max Emails per Hour:** 30 (padrão)
- **Max Emails per Day:** 100 (padrão)

---

## 📧 PASSO 2: CONFIGURAR TEMPLATES DE EMAIL

### 2.1 Acessar Templates

**Ir em:** `Authentication` → `Email Templates`

### 2.2 Template: Confirm Signup

**Quando é enviado:** Após registro de novo usuário

**Configuração recomendada:**

**Subject:**
```
Confirme seu email - ResenhApp
```

**Body (HTML):**
```html
<h2>Bem-vindo ao ResenhApp! 🎉</h2>

<p>Olá!</p>

<p>Obrigado por se cadastrar no ResenhApp. Para começar a usar a plataforma, confirme seu email clicando no link abaixo:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #1ABC9C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Confirmar Email
  </a>
</p>

<p>Ou copie e cole este link no navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p>Este link expira em 24 horas.</p>

<p>Se você não se cadastrou, pode ignorar este email.</p>

<p>Até logo!<br>Equipe ResenhApp</p>
```

**Variáveis disponíveis:**
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Email }}` - Email do usuário
- `{{ .Token }}` - Token de confirmação (não usar diretamente)

---

### 2.3 Template: Magic Link

**Quando é enviado:** Quando usuário solicita login via Magic Link

**Subject:**
```
Seu link de login - ResenhApp
```

**Body (HTML):**
```html
<h2>Olá! 👋</h2>

<p>Você solicitou um link de login para o ResenhApp.</p>

<p>Clique no botão abaixo para fazer login:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #1ABC9C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Fazer Login
  </a>
</p>

<p>Ou copie e cole este link no navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p>Este link expira em 1 hora.</p>

<p>Se você não solicitou este link, pode ignorar este email.</p>

<p>Até logo!<br>Equipe ResenhApp</p>
```

---

### 2.4 Template: Change Email Address

**Quando é enviado:** Quando usuário solicita mudança de email

**Subject:**
```
Confirme sua nova mudança de email - ResenhApp
```

**Body (HTML):**
```html
<h2>Confirmação de Mudança de Email</h2>

<p>Olá!</p>

<p>Você solicitou alterar seu email para: <strong>{{ .NewEmail }}</strong></p>

<p>Clique no botão abaixo para confirmar:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #1ABC9C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Confirmar Nova Email
  </a>
</p>

<p>Ou copie e cole este link no navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p>Este link expira em 24 horas.</p>

<p>Se você não solicitou esta mudança, ignore este email e entre em contato conosco.</p>

<p>Até logo!<br>Equipe ResenhApp</p>
```

**Variáveis disponíveis:**
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .NewEmail }}` - Novo email
- `{{ .Email }}` - Email atual

---

### 2.5 Template: Reset Password

**Quando é enviado:** Quando usuário solicita redefinição de senha

**Subject:**
```
Redefinir sua senha - ResenhApp
```

**Body (HTML):**
```html
<h2>Redefinição de Senha</h2>

<p>Olá!</p>

<p>Você solicitou redefinir sua senha no ResenhApp.</p>

<p>Clique no botão abaixo para criar uma nova senha:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #1ABC9C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Redefinir Senha
  </a>
</p>

<p>Ou copie e cole este link no navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p>Este link expira em 1 hora.</p>

<p>Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá a mesma.</p>

<p>Até logo!<br>Equipe ResenhApp</p>
```

**Variáveis disponíveis:**
- `{{ .ConfirmationURL }}` - Link de redefinição
- `{{ .Email }}` - Email do usuário

---

## 🌐 PASSO 3: CONFIGURAR SITE URL E REDIRECT URLs

### 3.1 Acessar URL Configuration

**Ir em:** `Authentication` → `URL Configuration`

### 3.2 Site URL

**⚠️ IMPORTANTE:**
- **Para DEV LOCAL (agora):** Configure no Supabase Dashboard
- **Para PRODUÇÃO (futuro):** Configure no Cloudflare + Supabase
- **Você pode ter AMBAS configuradas ao mesmo tempo!**

**Para Desenvolvimento Local (CONFIGURAR AGORA):**
```
http://localhost:3000
```

**Para Produção (CONFIGURAR DEPOIS no Cloudflare):**
```
https://resenhapp.uzzai.com.br
```

**Para Preview (Vercel - opcional):**
```
https://resenhapp.vercel.app
```

### 3.3 Redirect URLs

**📋 Para Teste Local (CONFIGURAR AGORA no Supabase):**

Adicionar estas URLs (uma por linha):
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/verify-email
```

**📋 Para Produção (CONFIGURAR DEPOIS no Cloudflare + Supabase):**

Quando configurar produção, adicionar também:
```
https://resenhapp.uzzai.com.br/auth/callback
https://resenhapp.uzzai.com.br/auth/reset-password
https://resenhapp.uzzai.com.br/auth/verify-email
```

**⚠️ IMPORTANTE:**
- **Agora:** Configure apenas as URLs de `localhost` para testar localmente
- **Depois:** Quando for para produção, adicione as URLs do Cloudflare também
- O Supabase aceita múltiplas URLs (dev + prod)
- URLs devem terminar com `/auth/callback` para OAuth
- URLs devem terminar com `/auth/reset-password` para reset de senha
- URLs devem terminar com `/auth/verify-email` para confirmação de email

---

## 🧪 PASSO 4: TESTE LOCAL

**📋 Guia rápido:** [TESTE-LOCAL-AUTH.md](./TESTE-LOCAL-AUTH.md)

### 4.1 Usar Arquivo de Teste

**O arquivo `test-auth.html` já foi criado na raiz do projeto!**

**Como usar:**
1. Abrir `test-auth.html` no navegador (duplo clique)
2. Ou servir via HTTP: `python -m http.server 8000`
3. Acessar: `http://localhost:8000/test-auth.html`

**Testar:**
- ✅ Cadastro (Sign Up)
- ✅ Login (Sign In)
- ✅ Reset Password
- ✅ Logout

### 4.2 Verificar Configuração

Antes de testar, verificar:
- [ ] Site URL: `http://localhost:3000` (configurado no Supabase)
- [ ] Redirect URLs: 3 URLs de localhost adicionadas
- [ ] Email/Password habilitado

### 4.3 Exemplo de Código (para referência)

Se quiser ver como funciona, o arquivo `test-auth.html` contém:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teste Auth - ResenhApp</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      background-color: #1ABC9C;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      font-size: 16px;
    }
    button:hover {
      background-color: #16a085;
    }
    .message {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
    }
    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .info {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }
  </style>
</head>
<body>
  <h1>🔐 Teste de Autenticação - ResenhApp</h1>

  <div id="auth-container">
    <!-- Sign Up Form -->
    <div id="signup-form">
      <h2>Cadastro</h2>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" id="signup-email" placeholder="seu@email.com" required>
      </div>
      <div class="form-group">
        <label>Senha:</label>
        <input type="password" id="signup-password" placeholder="Mínimo 6 caracteres" required>
      </div>
      <div class="form-group">
        <label>Nome Completo:</label>
        <input type="text" id="signup-name" placeholder="Seu Nome" required>
      </div>
      <button onclick="handleSignUp()">Cadastrar</button>
      <p style="text-align: center; margin-top: 15px;">
        Já tem conta? <a href="#" onclick="showSignIn()">Fazer Login</a>
      </p>
    </div>

    <!-- Sign In Form -->
    <div id="signin-form" style="display: none;">
      <h2>Login</h2>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" id="signin-email" placeholder="seu@email.com" required>
      </div>
      <div class="form-group">
        <label>Senha:</label>
        <input type="password" id="signin-password" placeholder="Sua senha" required>
      </div>
      <button onclick="handleSignIn()">Entrar</button>
      <p style="text-align: center; margin-top: 15px;">
        <a href="#" onclick="handleResetPassword()">Esqueci minha senha</a>
      </p>
      <p style="text-align: center; margin-top: 15px;">
        Não tem conta? <a href="#" onclick="showSignUp()">Cadastrar</a>
      </p>
    </div>
  </div>

  <!-- User Info (quando logado) -->
  <div id="user-info" style="display: none;">
    <h2>✅ Logado com sucesso!</h2>
    <div id="user-details"></div>
    <button onclick="handleSignOut()" style="background-color: #e74c3c; margin-top: 20px;">Sair</button>
  </div>

  <!-- Messages -->
  <div id="message"></div>

  <script>
    // ⚠️ SUBSTITUIR COM SUAS CREDENCIAIS
    const SUPABASE_URL = 'https://ujrvfkkkssfdhwizjucq.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Verificar se já está logado
    checkAuth();

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        showUserInfo(user);
      }
    }

    async function handleSignUp() {
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const name = document.getElementById('signup-name').value;

      showMessage('Cadastrando...', 'info');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            platform_role: 'player'
          }
        }
      });

      if (error) {
        showMessage('Erro: ' + error.message, 'error');
      } else {
        if (data.user && !data.user.email_confirmed_at) {
          showMessage('✅ Cadastro realizado! Verifique seu email para confirmar a conta.', 'success');
        } else {
          showMessage('✅ Cadastro realizado com sucesso!', 'success');
          showUserInfo(data.user);
        }
      }
    }

    async function handleSignIn() {
      const email = document.getElementById('signin-email').value;
      const password = document.getElementById('signin-password').value;

      showMessage('Fazendo login...', 'info');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showMessage('Erro: ' + error.message, 'error');
      } else {
        showMessage('✅ Login realizado com sucesso!', 'success');
        showUserInfo(data.user);
      }
    }

    async function handleResetPassword() {
      const email = document.getElementById('signin-email').value || prompt('Digite seu email:');
      
      if (!email) {
        showMessage('Email é obrigatório', 'error');
        return;
      }

      showMessage('Enviando email de redefinição...', 'info');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/auth/reset-password'
      });

      if (error) {
        showMessage('Erro: ' + error.message, 'error');
      } else {
        showMessage('✅ Email de redefinição enviado! Verifique sua caixa de entrada.', 'success');
      }
    }

    async function handleSignOut() {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showMessage('Erro: ' + error.message, 'error');
      } else {
        showMessage('✅ Logout realizado!', 'success');
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        document.getElementById('signin-form').style.display = 'none';
      }
    }

    function showUserInfo(user) {
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('user-info').style.display = 'block';
      
      const details = `
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Email Confirmado:</strong> ${user.email_confirmed_at ? '✅ Sim' : '❌ Não'}</p>
        <p><strong>Criado em:</strong> ${new Date(user.created_at).toLocaleString('pt-BR')}</p>
        ${user.user_metadata?.full_name ? `<p><strong>Nome:</strong> ${user.user_metadata.full_name}</p>` : ''}
      `;
      
      document.getElementById('user-details').innerHTML = details;
    }

    function showSignIn() {
      document.getElementById('signup-form').style.display = 'none';
      document.getElementById('signin-form').style.display = 'block';
    }

    function showSignUp() {
      document.getElementById('signin-form').style.display = 'none';
      document.getElementById('signup-form').style.display = 'block';
    }

    function showMessage(text, type) {
      const messageDiv = document.getElementById('message');
      messageDiv.className = `message ${type}`;
      messageDiv.textContent = text;
      messageDiv.style.display = 'block';
      
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }

    // Listener para mudanças de auth
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' && session) {
        showUserInfo(session.user);
      } else if (event === 'SIGNED_OUT') {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
      }
    });
  </script>
</body>
</html>
```

### 4.2 Testar Localmente

1. **Abrir o arquivo:**
   - Abrir `test-auth.html` no navegador
   - Ou servir via HTTP: `python -m http.server 8000` e acessar `http://localhost:8000/test-auth.html`

2. **Testar Fluxos:**
   - ✅ Cadastro (Sign Up)
   - ✅ Login (Sign In)
   - ✅ Reset Password
   - ✅ Logout

3. **Verificar Email:**
   - Se Email Confirmations estiver habilitado, verificar caixa de entrada
   - Clicar no link de confirmação

---

## ✅ CHECKLIST FINAL

- [ ] Email/Password habilitado
- [ ] Templates de email configurados (4 templates)
- [ ] Site URL configurado (`http://localhost:3000`)
- [ ] Redirect URLs adicionadas (3 URLs)
- [ ] Teste local executado
- [ ] Cadastro funcionando
- [ ] Login funcionando
- [ ] Reset password funcionando
- [ ] Emails sendo enviados corretamente

---

## 🐛 TROUBLESHOOTING

### Email não está sendo enviado

**Causas possíveis:**
1. Email Confirmations desabilitado (verificar em Settings)
2. Rate limit atingido (aguardar 1 hora)
3. Email em spam (verificar pasta de spam)
4. SMTP não configurado (Supabase usa serviço próprio por padrão)

**Solução:**
- Verificar `Authentication` → `Settings` → `Email`
- Verificar logs em `Authentication` → `Logs`

### Redirect URL não funciona

**Causa:** URL não está na lista de Redirect URLs permitidas

**Solução:**
- Adicionar URL exata em `Authentication` → `URL Configuration`
- URLs devem corresponder exatamente (incluindo protocolo e porta)

### "Email already registered"

**Causa:** Usuário já existe no banco

**Solução:**
- Fazer login em vez de cadastro
- Ou deletar usuário em `Authentication` → `Users`

---

## 📚 PRÓXIMOS PASSOS

Após configurar Auth:

1. **Integrar com Next.js:**
   - Criar `src/lib/supabase/client.ts`
   - Criar `src/lib/supabase/server.ts`
   - Criar middleware de auth

2. **Criar páginas de Auth:**
   - `/auth/signin`
   - `/auth/signup`
   - `/auth/reset-password`
   - `/auth/callback`

3. **Testar fluxo completo:**
   - Cadastro → Confirmação → Login → Dashboard

---

**Documento criado:** 2026-01-27
**Última atualização:** 2026-01-27

