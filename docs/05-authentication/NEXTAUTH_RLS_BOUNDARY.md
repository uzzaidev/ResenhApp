# NextAuth e RLS: Limite de Seguranca Atual

## Contexto

O projeto usa NextAuth (JWT em cookie) e acesso direto ao PostgreSQL via `postgres`.
Nesse modelo, as API routes nao executam com contexto `auth.uid()` do Supabase Auth.

## Implicacao

As policies RLS baseadas em `auth.uid()` nao podem ser tratadas como camada principal de seguranca para as rotas `src/app/api/**`.

## Regra de Seguranca em Vigor

A seguranca efetiva do app deve continuar nas API routes:

- `requireAuth()` para autenticar usuario.
- Validacao de membership/permissoes (`group_members`, RBAC, ownership).
- Filtros explicitos por `group_id` e `user_id` em todas as queries.

## Diretriz Operacional

- Considere RLS como camada complementar enquanto a autenticacao principal for NextAuth.
- Nao assuma que policy no banco, sozinha, protege endpoint do app.
- Toda rota nova deve manter validacao explicita de autorizacao no codigo.
