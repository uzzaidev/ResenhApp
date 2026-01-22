# 🔧 Fix: Erro `require is not defined` no tailwind.config.ts

**Erro corrigido:** 2026-01-27

---

## 🐛 PROBLEMA

Ao rodar `pnpm run dev`, o servidor falhava com:

```
ReferenceError: require is not defined
    at file:///C:/Projetos%20Uzz.Ai/peladeiros-main/tailwind.config.ts:69:12
```

**Causa:** O arquivo `tailwind.config.ts` estava usando `require()` em um contexto ESM (ES Modules), o que não é permitido no Next.js 16+.

---

## ✅ SOLUÇÃO

**Antes (linha 69):**
```typescript
plugins: [require("tailwindcss-animate")],
```

**Depois:**
```typescript
import tailwindcssAnimate from "tailwindcss-animate";

// ...

plugins: [tailwindcssAnimate],
```

---

## 📝 MUDANÇAS

1. **Adicionado import no topo:**
   ```typescript
   import tailwindcssAnimate from "tailwindcss-animate";
   ```

2. **Substituído require por variável:**
   ```typescript
   plugins: [tailwindcssAnimate],
   ```

---

## ✅ RESULTADO

- ✅ Servidor inicia corretamente
- ✅ Tailwind CSS funciona normalmente
- ✅ Sem erros de compilação

---

## 🎯 LIÇÃO APRENDIDA

**Regra:** Em arquivos TypeScript/ESM do Next.js 16+, sempre use `import` em vez de `require()`.

**Exceção:** Arquivos `.js` ou `.cjs` ainda podem usar `require()`.

---

**Documento criado:** 2026-01-27

