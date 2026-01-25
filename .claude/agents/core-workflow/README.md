# Core Workflow - Agentes Twin

**6 agentes especializados para workflow completo de desenvolvimento com QA integrado**

---

## 🎯 Visão Geral

Os agentes Core Workflow formam um sistema integrado para desenvolvimento end-to-end com qualidade garantida através de QA manual automatizado.

### Workflow Completo

```
1. twin-analyst 🔴
   ↓
2. twin-planner 🟢
   ↓
3. CHECKPOINT HUMANO (aprovação do plano)
   ↓
4. LOOP até QA passar:
   ├─ twin-developer 🔵 (implementa/fixa)
   ├─ twin-reviewer 🟣 (revisa código)
   └─ twin-tester ⚪ (QA manual via Playwright/curl)
      ├─ Se bugs → volta para developer
      └─ Se OK → continua
   ↓
5. twin-documenter 🟠 (documenta sessão)
```

---

## 👥 Agentes

### 1. twin-analyst 🔴
**Análise Técnica do Código Existente**

- Examina codebase relacionado à tarefa
- Identifica componentes UI existentes (frontend)
- Mapeia padrões de API/serviços (backend)
- Detecta constraints técnicos reais
- Fornece contexto para o planner

**Quando usar:**
- Início de qualquer task para entender estado atual
- Antes de criar plano de implementação

---

### 2. twin-planner 🟢
**Planejamento de Implementação Focado**

- Cria plano técnico direto e acionável
- Prioriza reuso de componentes (context-aware)
- Lista arquivos a modificar/criar
- Define ordem lógica de implementação
- Identifica riscos técnicos reais
- Cria plano de validação QA

**Quando usar:**
- Após twin-analyst para criar plano
- Para quebrar tasks grandes em etapas
- Quando precisa de plano técnico claro

**Diferencial:**
- Context-aware: recebe lista de componentes do analyst
- Evita over-engineering
- Planos diretos sem project management overhead

---

### 3. twin-developer 🔵
**Desenvolvimento Funcional (JS/TS)**

- Especialista em JavaScript/TypeScript
- Programação funcional estrita:
  - Apenas `const` (nunca `let` ou `var`)
  - Funções puras e imutabilidade
  - Sem comentários (código auto-explicativo)
  - Composição de funções
- Error handling robusto
- Recebe bug reports do tester e fixa

**Quando usar:**
- Implementação de features JS/TS
- Bug fixes reportados pelo tester
- Refatoração para programação funcional

**Diferencial:**
- Loop de feedback com tester
- Princípios FP muito específicos
- Código auto-documentado

---

### 4. twin-reviewer 🟣
**Revisão de Qualidade**

- Code review focado em:
  - Qualidade e padrões (SOLID, DRY)
  - Segurança (OWASP)
  - Performance (N+1, caching)
  - Programação funcional (se JS/TS)
  - Reuso de componentes UI
- Valida contra quality level (pragmatic/balanced/strict)
- Sugere melhorias sem over-engineering

**Quando usar:**
- Após implementação do developer
- Antes de passar para QA
- Code review de PRs

---

### 5. twin-tester ⚪
**QA Manual com Playwright**

- **Frontend:**
  - Usa Playwright MCP para abrir navegador real
  - Testa visualmente (clica, preenche, navega)
  - Testa happy path + edge cases
  - Captura screenshots de bugs

- **Backend:**
  - Usa curl para testar endpoints
  - Valida status codes e respostas
  - Testa validações e edge cases

- **Gera relatórios:**
  - Se bugs: Reproduction steps detalhados
  - Se OK: Validation success report

**Quando usar:**
- Após code review
- Para validar correções de bugs
- QA completo antes de commit

**Diferencial:**
- QA REAL usando browser automation
- Loop automático de retry (até 3x)
- Bug reports acionáveis

---

### 6. twin-documenter 🟠
**Documentação de Sessões**

- Documenta o que foi feito
- Registra decisões e tradeoffs
- Nota desvios do plano
- Inclui resultados de QA
- Salva em .claude/reports/twin-sessions/

**Quando usar:**
- Fim de cada workflow
- Após QA passar
- Para criar histórico de desenvolvimento

---

## 🎮 Como Usar

### Via Comando Principal

```bash
# Workflow completo automático
/twin-workflow "adicionar autenticação de usuário"

# Com quality level específico
/twin-workflow "refatorar módulo" --quality=strict
```

### Via /auto (Roteamento Inteligente)

```bash
# Auto detecta e roteia para twin-workflow se apropriado
/auto
```

### Invocação Manual de Agentes

```bash
# Via Task tool em prompts
Use the twin-analyst agent to analyze...
Use the twin-planner agent to create plan...
```

---

## 📊 Quality Levels

### pragmatic (padrão)
- Soluções diretas e funcionais
- Abstrações mínimas
- Error handling básico
- Foco em funcionalidade

### balanced
- Abstrações pensadas
- Error handling abrangente
- Padrões moderados
- Considerações de performance

### strict
- Padrões de design completos
- Todos edge cases cobertos
- Máxima reusabilidade
- Performance otimizada

---

## 🔄 Loop de QA Automático

O grande diferencial deste workflow:

```
developer implementa
  ↓
reviewer valida qualidade
  ↓
tester executa QA manual (Playwright)
  ↓
  ├─ BUGS ENCONTRADOS?
  │    ├─ tester gera bug report detalhado
  │    └─ volta para developer fixar
  │
  └─ TUDO OK?
       └─ documenter cria documentação
       └─ workflow completo!
```

**Máximo de 3 iterações.** Se ainda falhar, escalona para usuário.

---

## 🎯 Quando Usar Core Workflow vs Outros Agentes

### Use Core Workflow quando:
- ✅ Projeto é JS/TS (Node.js, React, Next.js)
- ✅ Task é feature ou bug focado
- ✅ Precisa de QA visual/manual
- ✅ Quer garantia de qualidade com retry loop

### Use Agentes Especialistas quando:
- ❌ Projeto não é JS/TS (Python, Java, etc.)
- ❌ Task é infra/DevOps/deploy
- ❌ Precisa expertise específica (blockchain, ML, etc.)

### Use Orquestradores quando:
- ❌ Task complexa multi-linguagem
- ❌ Envolve múltiplos serviços
- ❌ Requer coordenação de vários agentes

---

## 🔧 Integração com Sistema .claude

### Hooks
- Respeita pre-commit hooks existentes
- Respeita pre-push security scans
- Triggers post-task review após completar

### Quality Budgets
- Usa budgets do settings.json
- Valida coverage mínimo
- Verifica performance budgets

### Agentes Especialistas
- Pode invocar specialists quando necessário
- twin-planner pode chamar devops-maestro, python-expert, etc.

---

## 📝 Estrutura de Arquivos

```
projeto/
├── twin-plan-current.md           # Plano ativo (temporário)
├── twin-plans/                    # Planos arquivados
│   ├── 2025-11-07-14-30-plan.md
│   └── 2025-11-07-16-45-plan.md
└── .claude/reports/twin-sessions/ # Documentação
    └── session-2025-11-07.md
```

---

## ⚠️ Requisitos

### Obrigatórios:
- **Playwright MCP** instalado e configurado
- **Node.js** >= 18 (para projetos JS/TS)

### Opcionais:
- Dev server rodando (para QA frontend)
- API server rodando (para QA backend)

---

## 🎓 Melhores Práticas

1. **Sempre revise o plano** antes de aprovar (twin-plan-current.md)
2. **Use quality level apropriado**:
   - pragmatic: Protótipos e MVPs
   - balanced: Features normais
   - strict: Código crítico de produção
3. **Deixe o loop de QA trabalhar** - até 3 tentativas automáticas
4. **Consulte planos arquivados** para referência futura

---

## 📚 Documentação Adicional

- **PLANO_INTEGRACAO_HIBRIDO.md** - Como este sistema foi integrado
- **COMPARACAO_ANALISE_CLAUDE_CODE.md** - Análise comparativa
- **.claude/docs/TWIN_INTEGRATION_GUIDE.md** - Guia detalhado

---

**Versão:** 1.0
**Integrado em:** 2025-11-07
**Status:** ✅ Operacional
