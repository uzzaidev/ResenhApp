# 📚 Plano de Organização Completa da Documentação

> **Objetivo:** Organizar toda a documentação do projeto, incluindo raiz, docs, README, e criar estrutura profissional  
> **Prioridade:** 🔴 ALTA  
> **Tempo Estimado:** 2-3 horas

---

## 🎯 Objetivos Gerais

1. ✅ Organizar arquivos na raiz do projeto
2. ✅ Estruturar documentação em `docs/`
3. ✅ Atualizar README.md principal
4. ✅ Criar índice geral de documentação
5. ✅ Padronizar nomenclatura e estrutura
6. ✅ Criar guias de navegação
7. ✅ Documentar decisões técnicas importantes

---

## 📊 Situação Atual

### Arquivos na Raiz (Problemas Identificados)

**Arquivos de Documentação:**
- `AGENTS.md` - Documentação de agentes
- `ARQUITETURA_ERP_UZZAI_COMPLETA_R02.md` - Arquitetura ERP
- `ARQUITETURA-COMPLETA-SISTEMA-V2.md` - Arquitetura sistema
- `CHECKLIST-INICIO-V2.md` - Checklist
- `CLAUDE.md` - Documentação Claude
- `DATABASE-ARCHITECTURE-COMPLETE-V2.md` - Arquitetura DB
- `DATABASE-ARCHITECTURE-SUPABASE-V2.md` - Arquitetura Supabase
- `DECISOES-TECNICAS-V2.md` - Decisões técnicas
- `DEPLOY_CHECKLIST.md` - Checklist deploy
- `PELADEIROS-LANDING-PAGE-COMPLETE (1).html` - Landing page
- `PELADEIROS-PROJECT-DASHBOARD.md` - Dashboard projeto
- `PLANEJAMENTO-V2-INDEX.md` - Planejamento
- `PR_SUMMARY.md` - Resumo PR
- `README.md` - README principal ✅
- `REBRANDING-RESENHAPP.md` - Rebranding
- `SCHEMA_SETUP.md` - Setup schema
- `SETUP-INSTRUCOES.md` - Instruções setup
- `SUMARIO-EXECUTIVO-V2.md` - Sumário executivo
- `SUPABASE-MIGRATION-SUMMARY.md` - Resumo migration

**Arquivos de Configuração:**
- `components.json` ✅
- `package.json` ✅
- `tsconfig.json` ✅
- `tailwind.config.ts` ✅
- `next.config.ts` ✅
- `.env.local` ✅

**Arquivos de Debug/Test:**
- `debug-check-db.js`
- `debug-game-results.sql`
- `debug-pedro-stats.sql`
- `test-auth-debug.js`
- `test-auth.html`

**Screenshots:**
- `Screenshot_1.png` até `Screenshot_9.png`

**Outros:**
- `build-output.log`
- `nul`

---

## 📋 FASE 1: Organização da Raiz

### Tarefa 1.1: Criar Estrutura de Pastas para Documentação

**Status:** ⏸️ Pendente

**Ação:**
Criar estrutura:

```
docs/
├── 00-project-overview/          # Visão geral do projeto
│   ├── README.md                 # Índice geral
│   ├── PROJECT_SUMMARY.md         # Resumo do projeto
│   ├── ARCHITECTURE_OVERVIEW.md   # Visão geral arquitetura
│   └── REBRANDING.md              # Informações sobre rebranding
├── 01-getting-started/            # ✅ Já existe
├── 02-architecture/               # ✅ Já existe
│   └── SYSTEM_V2.md               # Arquitetura completa V2
├── 03-api/                        # ✅ Já existe
├── 04-database/                    # ✅ Já existe
│   └── SUPABASE_V2.md             # Arquitetura Supabase V2
├── 05-authentication/             # ✅ Já existe
├── 06-features/                   # ✅ Já existe
├── 07-deployment/                 # ✅ Já existe
├── 08-guides/                     # ✅ Já existe
├── 09-troubleshooting/            # ✅ Já existe
├── 10-improvements/               # ✅ Já existe
├── 11-app/                        # ✅ Já existe
├── 12-rebranding/                 # ✅ Já existe (renomear de "12 - Rebranding")
├── 13-decisions/                  # NOVO: Decisões técnicas
│   ├── README.md
│   ├── TECHNICAL_DECISIONS_V2.md
│   └── ARCHITECTURE_DECISIONS.md
├── 14-planning/                   # NOVO: Planejamento
│   ├── README.md
│   ├── PLANNING_V2_INDEX.md
│   └── CHECKLIST_INICIO_V2.md
└── 15-reference/                  # NOVO: Referências e resumos
    ├── README.md
    ├── EXECUTIVE_SUMMARY_V2.md
    ├── PR_SUMMARY.md
    └── MIGRATION_SUMMARY.md
```

**Verificação:**
- [ ] Estrutura criada
- [ ] Pastas numeradas corretamente
- [ ] Nomenclatura consistente

---

### Tarefa 1.2: Mover Arquivos da Raiz para Docs

**Status:** ⏸️ Pendente

**Ação:**

#### Mover para `docs/00-project-overview/`:
- [ ] `SUMARIO-EXECUTIVO-V2.md` → `EXECUTIVE_SUMMARY_V2.md`
- [ ] `REBRANDING-RESENHAPP.md` → `REBRANDING.md`
- [ ] `PELADEIROS-PROJECT-DASHBOARD.md` → `PROJECT_DASHBOARD.md`

#### Mover para `docs/02-architecture/`:
- [ ] `ARQUITETURA-COMPLETA-SISTEMA-V2.md` → `SYSTEM_V2.md`
- [ ] `ARQUITETURA_ERP_UZZAI_COMPLETA_R02.md` → `ERP_UZZAI_R02.md`

#### Mover para `docs/04-database/`:
- [ ] `DATABASE-ARCHITECTURE-COMPLETE-V2.md` → `ARCHITECTURE_V2.md`
- [ ] `DATABASE-ARCHITECTURE-SUPABASE-V2.md` → `SUPABASE_V2.md`
- [ ] `SCHEMA_SETUP.md` → `SCHEMA_SETUP.md`
- [ ] `SUPABASE-MIGRATION-SUMMARY.md` → `MIGRATION_SUMMARY.md`

#### Mover para `docs/07-deployment/`:
- [ ] `DEPLOY_CHECKLIST.md` → `DEPLOY_CHECKLIST.md`

#### Mover para `docs/13-decisions/`:
- [ ] `DECISOES-TECNICAS-V2.md` → `TECHNICAL_DECISIONS_V2.md`

#### Mover para `docs/14-planning/`:
- [ ] `PLANEJAMENTO-V2-INDEX.md` → `PLANNING_V2_INDEX.md`
- [ ] `CHECKLIST-INICIO-V2.md` → `CHECKLIST_INICIO_V2.md`

#### Mover para `docs/15-reference/`:
- [ ] `PR_SUMMARY.md` → `PR_SUMMARY.md`

#### Mover para `docs/12-rebranding/`:
- [ ] `PELADEIROS-LANDING-PAGE-COMPLETE (1).html` → `LANDING_PAGE.html`
- [ ] `SETUP-INSTRUCOES.md` → `SETUP_INSTRUCTIONS.md`

#### Mover para `docs/00-project-overview/`:
- [ ] `AGENTS.md` → `AGENTS.md`
- [ ] `CLAUDE.md` → `CLAUDE.md`

**Verificação:**
- [ ] Todos os arquivos movidos
- [ ] Nomes padronizados (snake_case ou kebab-case)
- [ ] Links atualizados

---

### Tarefa 1.3: Organizar Arquivos de Debug/Test

**Status:** ⏸️ Pendente

**Ação:**

Criar pasta `scripts/debug/`:
```
scripts/
├── debug/
│   ├── check-db.js
│   ├── game-results.sql
│   ├── pedro-stats.sql
│   ├── test-auth-debug.js
│   └── test-auth.html
```

Mover:
- [ ] `debug-check-db.js` → `scripts/debug/check-db.js`
- [ ] `debug-game-results.sql` → `scripts/debug/game-results.sql`
- [ ] `debug-pedro-stats.sql` → `scripts/debug/pedro-stats.sql`
- [ ] `test-auth-debug.js` → `scripts/debug/test-auth-debug.js`
- [ ] `test-auth.html` → `scripts/debug/test-auth.html`

**Verificação:**
- [ ] Arquivos movidos
- [ ] Estrutura criada

---

### Tarefa 1.4: Organizar Screenshots

**Status:** ⏸️ Pendente

**Ação:**

Criar pasta `docs/assets/screenshots/`:
```
docs/
└── assets/
    └── screenshots/
        ├── screenshot-1.png
        ├── screenshot-2.png
        ├── ...
        └── screenshot-9.png
```

Mover:
- [ ] `Screenshot_1.png` → `docs/assets/screenshots/screenshot-1.png`
- [ ] `Screenshot_2.png` → `docs/assets/screenshots/screenshot-2.png`
- [ ] ... (todos os screenshots)

**Verificação:**
- [ ] Screenshots movidos
- [ ] Nomes padronizados

---

### Tarefa 1.5: Limpar Arquivos Temporários

**Status:** ⏸️ Pendente

**Ação:**

Mover para `.gitignore` ou deletar:
- [ ] `build-output.log` → Adicionar ao `.gitignore`
- [ ] `nul` → Deletar (arquivo inválido)

**Verificação:**
- [ ] Arquivos temporários removidos
- [ ] `.gitignore` atualizado

---

## 📋 FASE 2: Atualização do README.md Principal

### Tarefa 2.1: Reestruturar README.md

**Status:** ⏸️ Pendente

**Ação:**

Criar estrutura melhorada:

```markdown
# ResenhApp V2.0

> Sistema de gestão de peladas de futebol

## 🚀 Quick Start

[Seção rápida de setup]

## 📚 Documentação

### Índice Geral
- [Visão Geral do Projeto](docs/00-project-overview/README.md)
- [Getting Started](docs/01-getting-started/README.md)
- [Arquitetura](docs/02-architecture/README.md)
- [API](docs/03-api/README.md)
- [Database](docs/04-database/README.md)
- [Autenticação](docs/05-authentication/README.md)
- [Features](docs/06-features/README.md)
- [Deployment](docs/07-deployment/README.md)
- [Guias](docs/08-guides/README.md)
- [Troubleshooting](docs/09-troubleshooting/README.md)
- [Melhorias](docs/10-improvements/README.md)
- [App](docs/11-app/README.md)
- [Rebranding](docs/12-rebranding/README.md)
- [Decisões Técnicas](docs/13-decisions/README.md)
- [Planejamento](docs/14-planning/README.md)
- [Referências](docs/15-reference/README.md)

### Documentação Essencial
- [Setup Completo](docs/01-getting-started/SETUP.md)
- [Arquitetura V2](docs/02-architecture/SYSTEM_V2.md)
- [Database Supabase](docs/04-database/SUPABASE_V2.md)
- [Deploy](docs/07-deployment/DEPLOYMENT_CHECKLIST.md)

## 🛠️ Stack Tecnológica

[Seção atual mantida]

## 📁 Estrutura do Projeto

[Seção atual mantida]

## 🔧 Desenvolvimento

[Seção atual mantida]
```

**Verificação:**
- [ ] Estrutura clara
- [ ] Links funcionam
- [ ] Informações essenciais destacadas

---

### Tarefa 2.2: Adicionar Seção de Contribuição

**Status:** ⏸️ Pendente

**Ação:**

Adicionar seção:

```markdown
## 🤝 Contribuindo

### Organização da Documentação

A documentação está organizada em `docs/` por categorias:

- `00-project-overview/` - Visão geral e resumos
- `01-getting-started/` - Guias de início
- `02-architecture/` - Arquitetura do sistema
- `03-api/` - Documentação da API
- `04-database/` - Database e migrations
- `05-authentication/` - Autenticação
- `06-features/` - Features específicas
- `07-deployment/` - Deploy e produção
- `08-guides/` - Guias diversos
- `09-troubleshooting/` - Solução de problemas
- `10-improvements/` - Melhorias futuras
- `11-app/` - App mobile
- `12-rebranding/` - Rebranding para ResenhApp
- `13-decisions/` - Decisões técnicas
- `14-planning/` - Planejamento
- `15-reference/` - Referências e resumos

### Convenções

- **Nomenclatura:** snake_case para arquivos de documentação
- **Estrutura:** Cada pasta tem um README.md com índice
- **Links:** Sempre usar caminhos relativos
```

**Verificação:**
- [ ] Seção adicionada
- [ ] Informações úteis

---

## 📋 FASE 3: Criar READMEs em Cada Pasta

### Tarefa 3.1: Criar README.md em Cada Pasta de Docs

**Status:** ⏸️ Pendente

**Ação:**

Para cada pasta em `docs/`, criar `README.md` com:

```markdown
# [Nome da Categoria]

> Descrição da categoria

## 📋 Índice

- [Documento 1](documento1.md) - Descrição
- [Documento 2](documento2.md) - Descrição
- ...

## 📚 Documentos Relacionados

- [Categoria Relacionada](../categoria-relacionada/README.md)
```

**Pastas a criar/atualizar:**
- [ ] `docs/00-project-overview/README.md`
- [ ] `docs/02-architecture/README.md` (atualizar)
- [ ] `docs/04-database/README.md` (atualizar)
- [ ] `docs/13-decisions/README.md` (criar)
- [ ] `docs/14-planning/README.md` (criar)
- [ ] `docs/15-reference/README.md` (criar)

**Verificação:**
- [ ] Todos os READMEs criados
- [ ] Índices completos
- [ ] Links funcionam

---

### Tarefa 3.2: Renomear Pasta "12 - Rebranding"

**Status:** ⏸️ Pendente

**Ação:**

- [ ] Renomear `docs/12 - Rebranding/` → `docs/12-rebranding/`
- [ ] Atualizar todos os links que referenciam esta pasta
- [ ] Verificar que não há quebras

**Verificação:**
- [ ] Pasta renomeada
- [ ] Links atualizados
- [ ] Nenhuma quebra

---

## 📋 FASE 4: Padronização

### Tarefa 4.1: Padronizar Nomenclatura

**Status:** ⏸️ Pendente

**Ação:**

Padronizar todos os arquivos para:
- **snake_case** para arquivos de documentação
- **kebab-case** para arquivos HTML/assets
- **PascalCase** apenas para componentes

**Exemplos:**
- `ARQUITETURA-COMPLETA-SISTEMA-V2.md` → `SYSTEM_V2.md`
- `CHECKLIST-INICIO-V2.md` → `CHECKLIST_INICIO_V2.md`
- `PELADEIROS-LANDING-PAGE-COMPLETE (1).html` → `LANDING_PAGE.html`

**Verificação:**
- [ ] Nomenclatura consistente
- [ ] Links atualizados

---

### Tarefa 4.2: Criar Índice Geral de Documentação

**Status:** ⏸️ Pendente

**Ação:**

Criar `docs/README.md`:

```markdown
# 📚 Documentação ResenhApp V2.0

> Documentação completa do projeto

## 🗂️ Estrutura

### 00. Project Overview
Visão geral do projeto, resumos executivos e informações gerais.

### 01. Getting Started
Guias para começar com o projeto.

### 02. Architecture
Arquitetura e estrutura do sistema.

### 03. API
Documentação das APIs.

### 04. Database
Estrutura e migrations do banco de dados.

### 05. Authentication
Sistema de autenticação.

### 06. Features
Documentação de features específicas.

### 07. Deployment
Deploy e produção.

### 08. Guides
Guias diversos.

### 09. Troubleshooting
Solução de problemas.

### 10. Improvements
Melhorias futuras.

### 11. App
App mobile.

### 12. Rebranding
Rebranding para ResenhApp.

### 13. Decisions
Decisões técnicas.

### 14. Planning
Planejamento.

### 15. Reference
Referências e resumos.

## 🚀 Quick Links

- [Setup Completo](01-getting-started/SETUP.md)
- [Arquitetura V2](02-architecture/SYSTEM_V2.md)
- [Database Supabase](04-database/SUPABASE_V2.md)
- [Deploy](07-deployment/DEPLOYMENT_CHECKLIST.md)
```

**Verificação:**
- [ ] Índice criado
- [ ] Links funcionam
- [ ] Estrutura clara

---

## 📋 FASE 5: Documentação Adicional

### Tarefa 5.1: Criar Guia de Navegação

**Status:** ⏸️ Pendente

**Ação:**

Criar `docs/NAVIGATION_GUIDE.md`:

```markdown
# 🧭 Guia de Navegação da Documentação

## Para Desenvolvedores Novos

1. Comece por: [Getting Started](01-getting-started/README.md)
2. Entenda a: [Arquitetura](02-architecture/README.md)
3. Configure o: [Database](04-database/README.md)
4. Leia sobre: [Deployment](07-deployment/README.md)

## Para Desenvolvedores Existentes

- [API Docs](03-api/API_DOCS.md)
- [Features](06-features/README.md)
- [Troubleshooting](09-troubleshooting/README.md)

## Para Gestores

- [Visão Geral](00-project-overview/README.md)
- [Sumário Executivo](00-project-overview/EXECUTIVE_SUMMARY_V2.md)
- [Planejamento](14-planning/README.md)
```

**Verificação:**
- [ ] Guia criado
- [ ] Links funcionam

---

### Tarefa 5.2: Atualizar .gitignore

**Status:** ⏸️ Pendente

**Ação:**

Adicionar ao `.gitignore`:

```gitignore
# Build outputs
build-output.log
*.log

# Debug files
scripts/debug/*.html
scripts/debug/*.js

# Temporary files
nul
```

**Verificação:**
- [ ] `.gitignore` atualizado
- [ ] Arquivos temporários ignorados

---

## ✅ Checklist Final

### Organização
- [ ] Estrutura de pastas criada
- [ ] Arquivos movidos para locais corretos
- [ ] Nomenclatura padronizada
- [ ] Screenshots organizados
- [ ] Arquivos de debug organizados

### Documentação
- [ ] README.md principal atualizado
- [ ] README.md em cada pasta criado
- [ ] Índice geral criado
- [ ] Guia de navegação criado
- [ ] Links atualizados

### Validação
- [ ] Todos os links funcionam
- [ ] Estrutura consistente
- [ ] Nomenclatura padronizada
- [ ] Documentação completa

---

## 📊 Métricas de Sucesso

### Antes
- ❌ 20+ arquivos na raiz
- ❌ Estrutura inconsistente
- ❌ Nomenclatura variada
- ❌ Sem índice geral

### Depois (Esperado)
- ✅ Máximo 5 arquivos essenciais na raiz
- ✅ Estrutura organizada e consistente
- ✅ Nomenclatura padronizada
- ✅ Índice geral completo

---

## 🚀 Próximos Passos

Após completar este plano:

1. ✅ Revisar todas as mudanças
2. ✅ Testar todos os links
3. ✅ Validar com equipe
4. ✅ Commit das mudanças
5. ✅ Atualizar documentação conforme necessário

---

**Criado em:** 2026-01-27  
**Status:** ⏸️ Aguardando Execução  
**Prioridade:** 🔴 ALTA


