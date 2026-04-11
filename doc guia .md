 Documentos editados (6 arquivos)

  00_MANIFEST.json
  - Versão: 0.1.0 → 0.2.0
  - Status do projeto atualizado: "Fases 0-4 implementadas em código, migrations PENDENTES"
  - Novo bloco deferred_mode com lista das 8 migrations pendentes e ordem de aplicação
  - Stats atualizados: ~320 arquivos TS/TSX, ~80 endpoints, 8 migrations pendentes

  IMPLEMENTATION_ROADMAP.md
  - Tabela de status no topo: cada fase com status de código + banco + próximo passo
  - Comando bash pronto para aplicar as 8 migrations em ordem
  - Lista dos 8 pontos de teste a executar após aplicar as migrations

  DELTA_ANALYSIS.md
  - Tabela de status geral no topo mostrando o que foi implementado (código vs banco vs testado)
  - Deixa claro: tudo em código ✅, banco ⏳, testes ❌

  18_TECH_DEBT_FINDINGS.md
  - Crons: marcados como RESOLVIDOS (3 rotas criadas + cron-auth.ts)
  - /api/debug público: marcado como RESOLVIDO
  - Nova seção "Novas Dívidas Técnicas" com 8 itens identificados (inconsistência MVP, migrations pendentes, UI de denúncia, etc.)

  99_AI_CONTEXT_PACK.md (reescrito)
  - Banner vermelho no topo: "O código está na frente do banco de dados"
  - Conceito de deferred mode explicado com exemplo de código
  - Tabela de todos os arquivos novos criados (lib, componentes, páginas)
  - Mapa Feature→Endpoint→Tabela expandido com as features novas e status ⏳/✅
  - 6 perguntas abertas restantes listadas

  ---
  Próximo passo: Aplicar as migrations e testar

  O roadmap agora tem o checklist completo de teste pós-migration. Quando você for fazer isso, é só seguir os 8 pontos listados no IMPLEMENTATION_ROADMAP.md.