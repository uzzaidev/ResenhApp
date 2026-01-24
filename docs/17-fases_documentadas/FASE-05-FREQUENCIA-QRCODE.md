# 📋 FASE 5: Frequência e Check-in QR Code

> **Duração:** Semana 11-12 (2 semanas)  
> **Status:** ⏸️ Planejado  
> **Prioridade:** 🟡 Média  
> **Depende de:** Fase 0, Fase 2

---

## 🎯 OBJETIVO DA FASE

Implementar sistema completo de frequência com QR Code check-in e rankings.

---

## 📝 TAREFAS DETALHADAS

### Tarefa 6.1: Backend - QR Code Check-in

**APIs:**
- `POST /api/events/[id]/qrcode` - Gerar QR Code
- `POST /api/checkin/qrcode` - Validar e fazer check-in
- `POST /api/checkin/manual` - Check-in manual
- `GET /api/events/[id]/checkins` - Lista de check-ins

**Bibliotecas:**
- `qrcode` (backend) - Gerar QR Codes
- `qrcode.react` (frontend) - Exibir QR Codes

**Checklist:**
- [ ] Implementar geração de QR Code
- [ ] Implementar validação
- [ ] Testar expiração
- [ ] Testar check-in único

---

### Tarefa 6.2: Backend - Estatísticas de Frequência

**APIs:**
- `GET /api/frequency/stats` - Estatísticas gerais
- `GET /api/frequency/ranking` - Ranking de frequência

**Checklist:**
- [ ] Implementar cálculos
- [ ] Criar APIs
- [ ] Otimizar queries

---

### Tarefa 6.3: Frontend - Página Frequência

**Componentes:**
- Cards de métricas
- Ranking Top 10
- QR Code visual
- Check-in manual
- Lista de check-ins

**Checklist:**
- [ ] Criar página completa
- [ ] Implementar QR Code display
- [ ] Criar componente de check-in manual

---

## ✅ CHECKLIST COMPLETO

- [ ] QR Code check-in funcionando
- [ ] Ranking de frequência
- [ ] UI completa de frequência

---

**Última atualização:** 2026-02-27  
**Status:** ⏸️ Planejado

