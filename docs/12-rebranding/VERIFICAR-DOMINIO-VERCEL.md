# ✅ Verificar Domínio no Vercel - ResenhApp

**Guia para Resolver "Verification Needed" no Vercel**

---

## 🎯 PROBLEMA

O Vercel mostra:
- ⚠️ **"Verification Needed"**
- ⚠️ **"This domain is linked to another Vercel account"**

**Solução:** Adicionar registro TXT no Cloudflare para verificar propriedade.

---

## 🚀 SOLUÇÃO RÁPIDA

### Passo 1: Copiar Valores do Vercel

No Vercel Dashboard → Domains → `resenhapp.uzzai.com.br`, copiar:

1. **TXT Record:**
   - Name: `_vercel`
   - Value: `vc-domain-verify=resenhapp.uzzai.com.br,XXXXX`
     - ⚠️ O valor `XXXXX` é único para seu projeto

2. **CNAME Record:**
   - Name: `resenhapp`
   - Value: `26835d59d72f3832.vercel-dns-017.com.`
     - ⚠️ Este valor pode variar por projeto

---

### Passo 2: Adicionar no Cloudflare

**Acessar:** https://dash.cloudflare.com/ → `uzzai.com.br` → DNS → Records

**1. Adicionar TXT Record (VERIFICAÇÃO):**

- Clicar em **"Add record"**
- **Type:** `TXT`
- **Name:** `_vercel`
- **Content:** `vc-domain-verify=resenhapp.uzzai.com.br,b8bd4ba63defff40fd92`
  - ⚠️ **Usar o valor exato do Vercel!**
- **Proxy status:** ❌ **DNS only** (nuvem cinza)
- **TTL:** Auto
- **Salvar**

**2. Adicionar CNAME Record (SUBDOMÍNIO):**

- Clicar em **"Add record"**
- **Type:** `CNAME`
- **Name:** `resenhapp`
- **Content:** `26835d59d72f3832.vercel-dns-017.com.`
  - ⚠️ **Usar o valor exato do Vercel!**
  - ⚠️ **Incluir o ponto final (.) no final**
- **Proxy status:** ❌ **DNS only** (inicialmente, para verificação)
- **TTL:** Auto
- **Salvar**

---

### Passo 3: Verificar no Vercel

1. **Aguardar 5-10 minutos** (propagação DNS)

2. **Voltar no Vercel:**
   - Ir em: Domains → `resenhapp.uzzai.com.br`
   - Clicar em **"Refresh"**

3. **Status deve mudar:**
   - De: ⚠️ "Verification Needed"
   - Para: ✅ "Valid Configuration" ou "Active"

---

### Passo 4: Ativar Proxy (Opcional - Recomendado)

**Após verificação bem-sucedida:**

1. **Voltar no Cloudflare:**
   - Editar o registro CNAME `resenhapp`
   - Ativar **Proxy** (nuvem laranja)
   - Salvar

2. **Benefícios do Proxy:**
   - ✅ SSL automático (HTTPS)
   - ✅ CDN (cache e performance)
   - ✅ Proteção DDoS

3. **Remover TXT Record (Opcional):**
   - Após verificação completa, pode remover o registro TXT `_vercel`
   - Não é obrigatório manter

---

## ✅ CHECKLIST

- [ ] TXT record `_vercel` adicionado no Cloudflare
- [ ] CNAME record `resenhapp` adicionado no Cloudflare
- [ ] Ambos com Proxy desabilitado (DNS only)
- [ ] Aguardado 5-10 minutos para propagação
- [ ] Clicado em "Refresh" no Vercel
- [ ] Status mudou para "Valid" ou "Active"
- [ ] (Opcional) Proxy ativado no CNAME
- [ ] (Opcional) TXT record removido após verificação

---

## 🐛 TROUBLESHOOTING

### Verificação ainda não funciona após 10 minutos

**Causas possíveis:**
1. Valor do TXT incorreto
2. DNS ainda propagando (aguardar mais)
3. Cache DNS local

**Solução:**
- Verificar se o valor do TXT está EXATAMENTE igual ao do Vercel
- Verificar se não tem espaços extras
- Limpar cache DNS: `ipconfig /flushdns` (Windows)
- Aguardar mais 10-15 minutos

### Erro: "Domain already in use"

**Causa:** Domínio está linkado a outra conta Vercel

**Solução:**
- Adicionar o TXT record `_vercel` conforme instruções
- Aguardar verificação
- Se não funcionar, verificar outras contas Vercel que possam ter o domínio

### CNAME não resolve

**Causa:** Proxy desabilitado ou valor incorreto

**Solução:**
- Verificar se o valor do CNAME está correto (com ponto final)
- Verificar se está como "DNS only" (nuvem cinza)
- Após verificação, pode ativar Proxy

---

## 📝 NOTAS IMPORTANTES

1. **Valores Únicos:**
   - Cada projeto Vercel tem valores únicos
   - Sempre usar os valores exatos mostrados no Vercel Dashboard

2. **Ordem Importante:**
   - Adicionar TXT primeiro (verificação)
   - Depois adicionar CNAME (subdomínio)
   - Aguardar verificação antes de ativar Proxy

3. **Proxy:**
   - Inicialmente: DNS only (para verificação)
   - Após verificação: Pode ativar Proxy (melhor performance)

---

**Documento criado:** 2026-01-27
**Última atualização:** 2026-01-27

