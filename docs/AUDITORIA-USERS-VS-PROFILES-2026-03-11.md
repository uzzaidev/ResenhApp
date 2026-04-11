# Auditoria users vs profiles (Fase 5)

Data: 2026-03-11  
Escopo: codigo de runtime (`src/app`, `src/lib`, `src/components`, `src/contexts`) e migrations.

## Resumo executivo

- Estado atual: `users` ja e a fonte canonica no runtime.
- Contagem no runtime:
  - `users`: 82 referencias SQL
  - `profiles`: 0 referencias SQL
- Conclusao: a migracao para `users` esta consolidada no runtime.

## Evidencias do runtime

- Nao ha mais `FROM/JOIN profiles` em `src/**`.
- `src/lib/auth.ts` autentica exclusivamente por `users`.
- Se a tabela `users` nao existir, o erro fica explicito para orientar aplicacao de migrations.

## Evidencias de schema (historico)

- Migrations antigas (janeiro/fevereiro) usam `profiles` em varios FKs.
- Migrations mais novas (marco) introduzem/forcam `users` em novos dominios e backfills.
- Sinal: existe historico hibrido real de schema, entao remocao abrupta de fallback pode quebrar ambientes parcialmente migrados.

## Acoes aplicadas nesta sessao

1. Middleware onboarding mudou para JWT-only.
   - removeu fetch ao Supabase no request path.
   - reduz latencia e simplifica comportamento.

2. Runtime de dominio reduzido para `users`.
   - `src/lib/modalities.ts`: removeu dependencias de `profiles` nas consultas de atletas.
   - `financeiro/charges/[chargeId]`: removido fallback de `profiles`; consulta agora usa apenas `users`.
   - `financeiro/charges/[chargeId]`: corrigida selecao de `created_by` para validar dono da cobranca com consistencia.
   - `src/lib/auth.ts`: removido fallback legado `profiles + auth.users`; auth agora e somente `users`.

## Recomendacao profissional (proximo passo)

Encerrar Fase 5 com checklist de operacao:

1. Validar migrations no ambiente alvo
   - confirmar existencia de `users` e coluna `onboarding_completed`.
   - confirmar que login/signup funcionam sem dependencia de `profiles`.

2. Auditoria de API auth
   - revisar handlers criticos em `src/app/api/**` para garantir `requireAuth()` consistente.

3. Smoke completo
   - login
   - onboarding
   - dashboard/eventos
   - financeiro (charges)
