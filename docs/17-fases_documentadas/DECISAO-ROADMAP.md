# 🎯 DECISÃO: Qual Roadmap Seguir?

> **Documento de decisão estratégica**
> **Data:** 2026-01-25

---

## 📊 RESUMO EXECUTIVO

Temos 2 caminhos:

| Aspecto | Roadmap Original (8 fases) | MVP Reorganizado |
|---------|---------------------------|------------------|
| **Duração até funcional** | 18 semanas | 6 semanas |
| **Primeiro valor entregue** | Semana 4 (Modalidades) | Semana 1 (RSVP) |
| **RSVP conectado** | Semana 5-6 | Semana 1 |
| **Auto-cobrança** | Semana 7-8 | Semana 1-2 |
| **Dashboard real** | Semana 17-18 | Semana 3-4 |
| **Multi-org** | Não previsto | Semana 5-6 |
| **Foco** | Features completas | Valor ao usuário |

---

## 🔍 ANÁLISE POR PERFIL

### 👤 ATLETA (Uso Diário)

#### O que ele PRECISA:
1. Ver próximos treinos (1 tela)
2. Confirmar presença (1 clique)
3. Ver quanto deve
4. Pagar rápido (QR Code)

#### Roadmap Original entrega:
- ❌ Semana 1-4: Nada útil (migrations, modalidades)
- ⚠️ Semana 5-6: RSVP avançado
- ⚠️ Semana 7-8: Pagamentos
- ❌ Semana 9-16: Features secundárias
- ✅ Semana 17-18: Dashboard completo

**Atleta espera 17 semanas para usar o app direito**

#### MVP Reorganizado entrega:
- ✅ Semana 1: RSVP funcionando
- ✅ Semana 2: Pagamento com QR Code
- ✅ Semana 3: Dashboard completo
- ✅ Semana 4-6: Refinamentos

**Atleta usa o app produtivamente desde semana 1**

---

### 👔 GESTOR DE GRUPO

#### O que ele PRECISA:
1. Criar treinos definindo preço
2. Ver quem confirmou
3. Cobrar automaticamente
4. Acompanhar caixa

#### Roadmap Original entrega:
- ❌ Semana 1-6: Sem cobrança automática
- ⚠️ Semana 7-8: Financeiro por treino
- ❌ Semana 9-16: Features não-críticas
- ✅ Semana 17-18: Dashboard final

**Gestor gerencia manualmente por 7 semanas**

#### MVP Reorganizado entrega:
- ✅ Semana 1-2: Auto-cobrança no RSVP
- ✅ Semana 3-4: Form criar treino + financeiro
- ✅ Semana 5-6: Treinos recorrentes

**Gestor automatiza desde semana 2**

---

### 🏛️ ATLÉTICA (Multi-Grupo)

#### O que precisa:
1. Ver múltiplos grupos
2. Dashboard consolidado
3. Relatórios financeiros
4. Definir quem recebe (admin vs instituição)

#### Roadmap Original entrega:
- ❌ Não prevê multi-org
- ❌ Dashboard só na semana 17
- ⚠️ Financeiro semana 7, mas sem consolidação

**Atlética não consegue usar o sistema**

#### MVP Reorganizado entrega:
- ✅ Semana 1: GroupContext (troca de grupos)
- ✅ Semana 2: ReceiverProfile (define recebedor)
- ✅ Semana 3-4: Dashboard + financeiro
- ✅ Semana 5-6: Instituições (multi-org)

**Atlética gerencia múltiplos grupos desde semana 6**

---

## 💰 ANÁLISE DE VALOR

### Roadmap Original

```
Semanas 1-4:   ▱▱▱▱ (0% utilizável)
Semanas 5-8:   ▰▱▱▱ (25% utilizável)
Semanas 9-12:  ▰▰▱▱ (50% utilizável)
Semanas 13-16: ▰▰▰▱ (75% utilizável)
Semanas 17-18: ▰▰▰▰ (100% utilizável)
```

**Valor acumulado:** Crescimento linear, pico no final

### MVP Reorganizado

```
Semanas 1-2:   ▰▰▰▱ (75% utilizável) ⚡
Semanas 3-4:   ▰▰▰▰ (100% utilizável) ⚡
Semanas 5-6:   ▰▰▰▰ (100% + extras)
```

**Valor acumulado:** Crescimento exponencial, pico rápido

---

## 🎲 MATRIZ DE DECISÃO

### Escolher Roadmap Original SE:

✅ Você quer features "completas" desde o início
✅ Não tem pressa para validar com usuários reais
✅ Modalidades complexas são mais importantes que pagamentos
✅ Pode esperar 18 semanas para ter app funcional
✅ Equipe grande (3+ devs) trabalhando em paralelo

### Escolher MVP Reorganizado SE:

✅ Quer validar com usuários reais rápido
✅ Precisa de receita/engajamento em <2 meses
✅ Loop RSVP → Pagamento é o core do negócio ⭐
✅ Equipe pequena (1-2 devs) focada
✅ Quer feedback real para decidir próximas features

---

## 🔥 PONTOS CRÍTICOS

### ⚠️ RISCOS do Roadmap Original

1. **Custo de oportunidade**: 17 semanas sem validar hipóteses
2. **Complexidade prematura**: Modalidades antes de pagamentos
3. **Dashboard tardio**: Feature mais importante por último
4. **Falta de GroupContext**: Multi-grupo não funciona
5. **Sem ReceiverProfile**: Atlética não define quem recebe

**Probabilidade de pivô antes da semana 18:** ALTA

### ✅ VANTAGENS do MVP Reorganizado

1. **Validação rápida**: Semana 2 já tem loop completo
2. **Feedback iterativo**: Ajusta features baseado em uso real
3. **Custo menor**: 6 semanas vs 18 para MVP
4. **Multi-org desde cedo**: Atlética já usa
5. **Foco no core**: RSVP + Pagamento é o diferencial

**Probabilidade de pivô:** BAIXA (valida rápido)

---

## 🧪 TESTE PRÁTICO

### Pergunte-se:

**1. Se você tivesse que vender o app HOJE para 1 atlética, qual roadmap fecha a venda?**
- Original: "Estará pronto em 18 semanas, mas terá tudo"
- Reorganizado: "Pronto em 6 semanas, refinamos juntos"

**2. Se um usuário testar na semana 4, qual experiência ele tem?**
- Original: "Legal ter modalidades, mas cadê o RSVP?"
- Reorganizado: "Já uso todo dia, funciona!"

**3. Se você descobrir que ninguém usa modalidades avançadas?**
- Original: Perdeu 4 semanas (semanas 3-6)
- Reorganizado: Não implementou ainda, foca em outra coisa

---

## 📋 RECOMENDAÇÃO FINAL

### 🎯 ESCOLHA: MVP REORGANIZADO

**Motivos:**

1. **Entrega valor 3x mais rápido** (6 sem vs 18 sem)
2. **Foco no loop crítico** (RSVP → Cobrança → Pix)
3. **Multi-org funcionando** (Atlética pode usar)
4. **Validação com usuários reais** em <2 meses
5. **Custo menor** de desenvolvimento
6. **Flexibilidade** para pivotar baseado em feedback

**Plano de Migração:**

```
✅ Semanas 1-6:  MVP Reorganizado (este documento)
⏸️ Semana 7+:    Revisar e priorizar do Roadmap Original conforme feedback
```

**Features do Original que VALE A PENA manter pós-MVP:**
- ✅ FASE 1: Modalidades (mas simplificado)
- ✅ FASE 2: Treinos recorrentes (já no Sprint 3)
- ❌ FASE 4: Jogos Oficiais (nice-to-have)
- ❌ FASE 5: QR Code Check-in (inovação, não MVP)
- ❌ FASE 6: Rankings avançados (nice-to-have)
- ❌ FASE 7: Tabelinha Tática (diferencial futuro)
- ✅ FASE 8: Dashboard (já no Sprint 2)

---

## ✅ PRÓXIMA AÇÃO

**Se você concorda com MVP Reorganizado:**

1. ✅ Arquivar plano original (manter como referência)
2. ✅ Iniciar Sprint 1 - Tarefa 1.1 (GroupContext)
3. ✅ Atualizar FASE-ATUAL.md com novo roadmap
4. ✅ Comunicar mudança para time/stakeholders

**Se você prefere Roadmap Original:**

1. ✅ Continuar com FASE 0 (Migrations)
2. ✅ Iniciar FASE 1 (Modalidades) na semana 3
3. ✅ Aceitar 18 semanas até MVP completo

---

**Criado em:** 2026-01-25
**Decisão:** Aguardando aprovação do usuário
**Status:** 🟡 Pendente

---

## 🗳️ SUA DECISÃO

**Marque abaixo:**

- [ ] **APROVADO:** MVP Reorganizado (6 semanas)
- [ ] **REJEITO:** Manter Roadmap Original (18 semanas)
- [ ] **HÍBRIDO:** Quero discutir ajustes

**Comentários/Ajustes:**
```
[Escreva aqui suas considerações]
```
