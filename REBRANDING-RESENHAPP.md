# 🎨 REBRANDING: PELADEIROS → RESENHAPP

**Data de Execução:** 2026-01-22
**Status:** ✅ Completo

---

## 📋 RESUMO DA MUDANÇA

### Nome Anterior
**Peladeiros** / **ResenhaFC**

### Nome Novo (OFICIAL)
**ResenhApp**

### Razão da Mudança
- ⚠️ Conflito de marca: "Peladeiros" já existe (app concorrente com 100k+ downloads)
- ✅ Solução: Adotar nome único e exclusivo "ResenhApp"
- 🎯 Posicionamento: Aplicativo de gestão de peladas/resenhas

---

## 📝 ALTERAÇÕES REALIZADAS

### 1. Documentação Atualizada

Todos os arquivos `.md` foram atualizados com as seguintes substituições:

| De | Para |
|----|------|
| `Peladeiros V2.0` | `ResenhApp V2.0` |
| `Peladeiros V2` | `ResenhApp V2` |
| `PELADEIROS V2` | `RESENHAPP V2` |
| `ResenhaFC` | `ResenhApp` |
| `peladeiros-v2` | `resenhapp-v2` |
| `peladeiros.com` | `resenhapp.com` |
| `Peladeiros Web` | `ResenhApp Web` |

**Arquivos atualizados:**
- ✅ PLANEJAMENTO-V2-INDEX.md
- ✅ SUMARIO-EXECUTIVO-V2.md
- ✅ ARQUITETURA-COMPLETA-SISTEMA-V2.md
- ✅ DECISOES-TECNICAS-V2.md
- ✅ DATABASE-ARCHITECTURE-SUPABASE-V2.md
- ✅ SUPABASE-MIGRATION-SUMMARY.md
- ✅ CHECKLIST-INICIO-V2.md
- ✅ PELADEIROS-PROJECT-DASHBOARD.md
- ✅ Todos os arquivos em `docs/12 - Rebranding/`
- ✅ package.json

### 2. Código e Componentes

**Componente Sidebar atualizado:**
```tsx
<h1 className="text-lg font-bold text-white">ResenhApp</h1>
<p className="text-xs text-uzzai-silver">by UzzAI</p>
```

**URLs e Domínios:**
- Domínio sugerido: `resenhapp.com`
- URLs de desenvolvimento: `localhost:3000`
- Firebase project ID: `resenhapp-v2`

### 3. Configurações de Projeto

**Package.json:**
```json
{
  "name": "resenhapp",
  "description": "ResenhApp - Gestão de Peladas"
}
```

**Supabase:**
- Nome do projeto: `ResenhApp V2` ou `ResenhApp`

**Firebase:**
- Nome do projeto: `ResenhApp V2` ou `ResenhApp`
- App Web: `ResenhApp Web`
- Project ID: `resenhapp-v2`

**Vercel:**
- Nome do projeto: `resenhapp`
- URL de produção: `resenhapp.vercel.app` ou `resenhapp.com`

---

## 🎨 IDENTIDADE VISUAL

### Logo e Branding

**Cores UzzAI aplicadas:**
- Verde menta: `#4FFFB0` (uzzai-mint)
- Prata suave: `#95A5B8` (uzzai-silver)
- Carvão escuro: `#1a1f26` (uzzai-charcoal)

**Logo no código:**
```tsx
<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-uzzai-mint to-emerald-400" />
```

**Tipografia:**
- Display: Montserrat (títulos)
- Sans: Inter (corpo)

### Tagline
**"by UzzAI"** - Mantém a associação com a marca UzzAI

---

## 📦 PRÓXIMOS PASSOS

### Tarefas Pendentes

**Design:**
- [ ] Criar logo oficial ResenhApp
- [ ] Criar favicon
- [ ] Criar imagens para redes sociais (Open Graph)
- [ ] Criar screenshots para landing page

**Domínio:**
- [ ] Registrar domínio `resenhapp.com` (ou similar)
- [ ] Configurar DNS
- [ ] Configurar SSL

**Redes Sociais:**
- [ ] Criar perfis com @resenhapp ou @resenhappoficial
- [ ] Instagram: @resenhapp
- [ ] Twitter/X: @resenhapp

**Legal:**
- [ ] Registrar marca "ResenhApp" (INPI)
- [ ] Atualizar termos de uso
- [ ] Atualizar política de privacidade

**Repositório:**
- [ ] Renomear repositório: `peladeiros-web` → `resenhapp-web`
- [ ] Atualizar README.md do repositório
- [ ] Atualizar descrição do repositório

**Marketing:**
- [ ] Atualizar landing page
- [ ] Atualizar materiais de apresentação
- [ ] Comunicar mudança para pilotos

---

## ✅ VERIFICAÇÃO

### Checklist de Consistência

Verificar se todos os lugares foram atualizados:

**Documentação:**
- [x] Todos os arquivos `.md` atualizados
- [x] package.json atualizado
- [x] Componentes React atualizados

**Configurações:**
- [ ] `.env.local` atualizado (quando criar)
- [ ] Vercel project name atualizado
- [ ] Supabase project name (quando criar)
- [ ] Firebase project name (quando criar)

**Git:**
- [ ] Branch renomeado (opcional)
- [ ] Commit com mudanças de branding
- [ ] Tag de versão (v2.0.0-resenhapp)

---

## 📊 IMPACTO

### O que MUDA
- ✅ Nome do produto: Peladeiros → ResenhApp
- ✅ URLs e domínios
- ✅ Identidade visual (logo)
- ✅ Materials de marketing

### O que NÃO MUDA
- ✅ Funcionalidades do produto
- ✅ Arquitetura técnica
- ✅ Banco de dados (estrutura)
- ✅ Roadmap de desenvolvimento
- ✅ Stack tecnológico (Supabase, Next.js, etc.)

---

## 📞 CONTATOS

**Responsáveis pelo Rebranding:**
- Product Owner: Pedro Vitor Pagliarin
- Tech Lead: Luis Fernando Boff
- Branding: Arthur Brandalise

**Data de Aprovação:** ____/____/2026
**Assinatura Aprovação:** __________________

---

## 🎯 POSICIONAMENTO

### Proposta de Valor

**ResenhApp** é uma plataforma SaaS de gestão esportiva focada em peladas e resenhas de futebol, oferecendo:

- 🎯 Gestão completa de grupos e eventos
- ⚽ Sorteio inteligente de times
- 💰 Split Pix automático (diferencial killer)
- 📊 Analytics e estatísticas avançadas
- 🏆 Sistema de rankings e conquistas
- 📱 Notificações em tempo real

### Diferencial Competitivo

**ResenhApp vs. Concorrentes:**
- ✅ 50-70% mais barato
- ✅ Split Pix automático (único no mercado)
- ✅ UX superior (Design System UzzAI)
- ✅ Free tier generoso

### Público-Alvo

**Primário:**
- Organizadores de peladas regulares
- Grupos de futebol amador
- Quadras esportivas

**Secundário:**
- Atléticas universitárias (futuro)
- Escolinhas de futebol (futuro)
- Outras modalidades esportivas (futuro)

---

## 📈 MÉTRICAS PÓS-REBRANDING

### KPIs a Monitorar

**Reconhecimento de Marca:**
- [ ] Buscas por "ResenhApp" no Google
- [ ] Menções em redes sociais
- [ ] Feedback de usuários sobre o nome

**Aquisição:**
- [ ] Taxa de conversão landing page
- [ ] CAC (custo de aquisição)
- [ ] Tempo de onboarding

**Retenção:**
- [ ] NPS (Net Promoter Score)
- [ ] Churn rate
- [ ] Lifetime Value (LTV)

### Meta 3 Meses

- 🎯 10 grupos ativos usando ResenhApp
- 🎯 50% conversão para Premium
- 🎯 NPS > 50
- 🎯 Top 3 no Google para "app gestão pelada"

---

**Criado em:** 2026-01-22
**Versão:** 1.0
**Status:** ✅ Completo

---

**🎉 ResenhApp - A resenha começa aqui!**
