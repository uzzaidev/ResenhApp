# Módulo: AUTH

## Visão Geral

O módulo AUTH gerencia toda a autenticação de usuários da plataforma ResenhApp. Utiliza NextAuth.js com Credentials Provider, JWT strategy e senhas protegidas com bcryptjs. O módulo cobre o fluxo completo desde o formulário de login até o cookie de sessão persistido no navegador.

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/auth/signin` | Página de login — formulário de e-mail e senha |
| `/auth/signup` | Página de cadastro — formulário de novo usuário |
| `/auth/error` | Página de erro de autenticação — exibida em falhas do NextAuth |

---

## API Endpoints

### `POST /api/auth/signup`

Cria um novo usuário na base de dados.

**Request Body:**
```json
{
  "name": "string (obrigatório)",
  "email": "string (obrigatório, formato email válido)",
  "password": "string (obrigatório, mínimo 6 caracteres)"
}
```

**Validação (Zod Schema):**
```typescript
const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})
```

**Rate Limit:** 5 requisições por minuto por IP.

**Respostas:**
- `201 Created` — Usuário criado com sucesso
- `400 Bad Request` — Dados inválidos (falha no schema Zod)
- `409 Conflict` — E-mail já cadastrado
- `429 Too Many Requests` — Rate limit excedido

**Processo interno:**
1. Valida o body com Zod
2. Verifica se e-mail já existe no banco
3. Faz hash da senha com `bcryptjs` (`bcrypt.hash(password, 10)`)
4. Insere o usuário na tabela `users`
5. Retorna o usuário criado (sem a senha)

---

### `GET|POST /api/auth/[...nextauth]`

Handler catch-all do NextAuth.js. Gerencia internamente todas as rotas de autenticação:

| Método | Rota interna | Descrição |
|--------|-------------|-----------|
| `GET` | `/api/auth/session` | Retorna a sessão atual |
| `GET` | `/api/auth/csrf` | Retorna o token CSRF |
| `GET` | `/api/auth/providers` | Lista os providers disponíveis |
| `POST` | `/api/auth/signin/credentials` | Executa o login com credenciais |
| `GET/POST` | `/api/auth/signout` | Realiza o logout |
| `GET` | `/api/auth/callback/credentials` | Callback pós-autenticação |

---

## Arquivos de Biblioteca

### `src/lib/auth.ts`

Configuração principal do NextAuth.js.

**Responsabilidades:**
- Define o `CredentialsProvider` com os campos `email` e `password`
- Implementa a função `authorize` que valida as credenciais
- Configura a strategy JWT
- Define os callbacks `jwt` e `session` para enriquecer o token/sessão com dados do usuário (`id`, `name`, `email`, `role`)
- Exporta `authOptions` para uso no handler do NextAuth e em Server Components via `getServerSession`

**Configuração de Sessão:**
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
}
```

**Fluxo da função `authorize`:**
1. Recebe `email` e `password` das credenciais
2. Busca o usuário na tabela `users` pelo e-mail
3. Compara a senha fornecida com o hash armazenado via `bcryptjs.compare`
4. Retorna o objeto de usuário em caso de sucesso
5. Retorna `null` em caso de credenciais inválidas (NextAuth redireciona para `/auth/error`)

**Callbacks:**
```typescript
callbacks: {
  jwt: async ({ token, user }) => {
    if (user) {
      token.id = user.id
      token.role = user.role
    }
    return token
  },
  session: async ({ session, token }) => {
    if (token) {
      session.user.id = token.id
      session.user.role = token.role
    }
    return session
  },
}
```

---

### `src/lib/auth-helpers.ts`

Funções utilitárias auxiliares para autenticação.

**Funções exportadas:**

| Função | Descrição |
|--------|-----------|
| `getAuthenticatedUser()` | Obtém o usuário da sessão atual em Server Components; lança erro se não autenticado |
| `requireAdminRole(session)` | Valida que o usuário tem role `admin`; lança erro 403 se não |
| `hashPassword(password)` | Encapsula `bcryptjs.hash` com salt rounds padrão (10) |
| `comparePasswords(plain, hashed)` | Encapsula `bcryptjs.compare` |
| `validateSignupInput(data)` | Executa o schema Zod de signup e retorna resultado tipado |

---

## Fluxo Completo de Autenticação

```
1. Usuário acessa /auth/signin
        |
2. Preenche e-mail + senha no formulário
        |
3. Formulário faz POST para /api/auth/signin/credentials (NextAuth)
        |
4. NextAuth chama a função authorize() em auth.ts
        |
5. authorize() busca o usuário no banco pelo e-mail
        |
6. bcryptjs.compare() verifica a senha contra o hash
        |
      [OK]                        [FALHA]
        |                            |
7a. NextAuth gera JWT          7b. NextAuth redireciona
    com id, email, role             para /auth/error
        |
8. JWT é assinado e serializado
        |
9. Cookie next-auth.session-token é definido
   (HttpOnly, Secure, SameSite=Lax)
   Duração: 30 dias
        |
10. Usuário é redirecionado para /dashboard
```

---

## Fluxo de Cadastro

```
1. Usuário acessa /auth/signup
        |
2. Preenche name, e-mail, senha
        |
3. Formulário faz POST para /api/auth/signup
        |
4. Rate limiter verifica: <= 5 req/min por IP
        |
      [OK]                     [BLOQUEADO]
        |                          |
5. Zod valida os dados       Retorna 429
        |
      [OK]                    [INVÁLIDO]
        |                         |
6. Verifica e-mail único     Retorna 400
        |
      [ÚNICO]                 [DUPLICADO]
        |                         |
7. bcryptjs.hash(senha, 10)  Retorna 409
        |
8. INSERT na tabela users
        |
9. Retorna 201 Created
        |
10. Frontend redireciona para /auth/signin
```

---

## Segurança

| Mecanismo | Detalhe |
|-----------|---------|
| Hash de senha | `bcryptjs` com 10 salt rounds |
| Transmissão | HTTPS obrigatório em produção |
| Cookie | `HttpOnly`, `Secure`, `SameSite=Lax` |
| JWT | Assinado com `NEXTAUTH_SECRET` (env var) |
| Rate limit | 5 requisições/minuto por IP no endpoint de signup |
| Validação | Zod schema com mínimo de 6 caracteres para senha |
| CSRF | Token CSRF gerenciado automaticamente pelo NextAuth |

---

## Variáveis de Ambiente Necessárias

| Variável | Descrição |
|----------|-----------|
| `NEXTAUTH_SECRET` | Segredo para assinar os JWTs |
| `NEXTAUTH_URL` | URL base da aplicação (ex: `https://app.resenhapp.com`) |
| `DATABASE_URL` | Connection string do banco de dados |

---

## Dependências

| Pacote | Versão | Uso |
|--------|--------|-----|
| `next-auth` | ^4.x | Framework de autenticação |
| `bcryptjs` | ^2.x | Hash e comparação de senhas |
| `zod` | ^3.x | Validação de schema do signup |

---

## Tabelas do Banco de Dados

### `users`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `name` | VARCHAR | Nome do usuário |
| `email` | VARCHAR UNIQUE | E-mail do usuário |
| `password_hash` | VARCHAR | Senha hasheada com bcryptjs |
| `role` | VARCHAR | Papel do usuário (`admin`, `player`) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de última atualização |

---

## Notas de Implementação

- O NextAuth está configurado no App Router via `src/app/api/auth/[...nextauth]/route.ts`
- Em Server Components, a sessão é obtida via `getServerSession(authOptions)`
- Em Client Components, a sessão é obtida via o hook `useSession()` do `next-auth/react`
- O middleware do Next.js (`middleware.ts`) protege as rotas privadas verificando a presença do cookie de sessão antes de permitir o acesso
- Rotas públicas (ex: `/auth/signin`, `/auth/signup`, `/`) são explicitamente excluídas do middleware
