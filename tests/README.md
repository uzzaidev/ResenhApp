# 🧪 Testes - Sprint 1: GroupContext

> **Status:** ✅ Testes Críticos (Fase 1) Implementados  
> **Cobertura:** Unit Tests + Integration Tests

---

## 📋 Estrutura de Testes

```
tests/
├── setup.ts                          # Configuração global
├── unit/
│   └── contexts/
│       └── group-context.test.tsx   # Testes do hook useGroup()
├── integration/
│   └── api/
│       └── groups-switch.test.ts    # Testes da API /api/groups/switch
└── README.md                         # Este arquivo
```

---

## 🚀 Como Rodar os Testes

### Rodar todos os testes
```bash
pnpm test
```

### Rodar em modo watch (desenvolvimento)
```bash
pnpm test
# Pressione 'a' para rodar todos os testes
# Pressione 'f' para rodar apenas os que falharam
```

### Rodar com UI interativa
```bash
pnpm test:ui
```

### Rodar uma vez (CI/CD)
```bash
pnpm test:run
```

### Rodar com coverage
```bash
pnpm test:coverage
```

---

## ✅ Testes Implementados

### Unit Tests - `useGroup()` Hook

**Arquivo:** `tests/unit/contexts/group-context.test.tsx`

**Cenários testados:**
- ✅ Validação de Provider (erro se usado fora)
- ✅ Carregamento inicial de grupos
- ✅ Restauração de grupo do localStorage
- ✅ Fallback para primeiro grupo
- ✅ `setCurrentGroup()` atualiza estado e localStorage
- ✅ `switchGroup()` alterna grupo com sucesso
- ✅ `switchGroup()` trata erros corretamente
- ✅ Tratamento de erros ao carregar grupos
- ✅ Aliases `userGroups` e `fetchUserGroups`

**Total:** 10+ cenários de teste

---

### Integration Tests - Lógica da API `/api/groups/switch`

**Arquivo:** `tests/integration/api/groups-switch-logic.test.ts`

**Cenários testados:**
- ✅ Validação de entrada (groupId obrigatório)
- ✅ Validação de membership (403 se não for membro)
- ✅ Alternância bem-sucedida (admin e member)
- ✅ Configuração correta do cookie
- ✅ Query SQL executada corretamente

**Total:** 9 cenários de teste

---

## 📊 Cobertura Atual

### Status dos Testes
- ✅ **46 testes passando** (100% de sucesso)
- ✅ **13 testes unitários** do hook `useGroup()`
- ✅ **9 testes de integração** da lógica da API
- ✅ **13 testes unitários** dos helpers server
- ✅ **11 testes de componente** do `GroupSwitcher`

### Componentes Testados
- ✅ `GroupProvider` - Context Provider
- ✅ `useGroup()` - Hook principal
- ✅ `getUserCurrentGroup()` - Helper server
- ✅ `getUserGroups()` - Helper server
- ✅ `GroupSwitcher` - Componente UI
- ✅ Lógica da API `/api/groups/switch` - Alternância de grupo

### Funcionalidades Cobertas
- ✅ Carregamento de grupos
- ✅ Seleção de grupo
- ✅ Persistência (localStorage)
- ✅ Alternância de grupo
- ✅ Validação de membership
- ✅ Tratamento de erros
- ✅ Sincronização cookie ↔ localStorage
- ✅ Configuração de cookies

---

## ✅ Fase 2 Completa

### Implementado
- ✅ Component tests do `GroupSwitcher` (11 testes)
- ✅ Unit tests dos helpers server (13 testes)

## 🔄 Próximos Passos (Fase 3 - E2E)

### Pendente (Opcional)
- [ ] Configurar Playwright
- [ ] E2E test básico de alternância
- [ ] E2E test de persistência entre sessões

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/...'"
**Solução:** Verifique se o `vitest.config.ts` tem o alias `@` configurado corretamente.

### Erro: "localStorage is not defined"
**Solução:** O ambiente `jsdom` já está configurado no `vitest.config.ts`. Se persistir, verifique o `tests/setup.ts`.

### Mock não funciona
**Solução:** Certifique-se de que os mocks estão no `tests/setup.ts` ou no início do arquivo de teste.

---

## 📝 Notas

- Os testes usam `jsdom` para simular ambiente de navegador
- Mocks globais estão em `tests/setup.ts`
- Todos os testes são isolados (limpeza automática entre testes)
- Coverage pode ser gerado com `pnpm test:coverage`

---

**Última atualização:** 2026-01-25  
**Status:** ✅ Fase 1 Completa

