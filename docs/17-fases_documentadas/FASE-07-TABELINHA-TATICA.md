# 📋 FASE 7: Tabelinha Tática

> **Duração:** Semana 15-16 (2 semanas)  
> **Status:** ⏸️ Planejado  
> **Prioridade:** 🟢 Baixa  
> **Depende de:** Fase 0, Fase 1

---

## 🎯 OBJETIVO DA FASE

Implementar campo visual interativo para criação e planejamento de táticas.

---

## 📝 TAREFAS DETALHADAS

### Tarefa 8.1: Backend - Táticas Salvas

**APIs:**
- `POST /api/tactics` - Salvar tática
- `GET /api/tactics` - Listar táticas
- `GET /api/tactics/[id]` - Obter tática
- `DELETE /api/tactics/[id]` - Deletar tática

**Checklist:**
- [ ] Implementar todas as APIs
- [ ] Validar estrutura JSONB
- [ ] Testar CRUD completo

---

### Tarefa 8.2: Frontend - Campo Tático

**Componentes:**
- `TacticalField` - Campo SVG
- `PlayerMarker` - Marcador arrastável
- `PlayerList` - Lista de jogadores
- `FormationSelector` - Seletor de formação
- `DrawingTools` - Ferramentas de desenho
- `SavedTacticsList` - Lista de táticas salvas

**Bibliotecas:**
- `@dnd-kit/core` - Drag and drop
- SVG inline ou `react-svg`

**Checklist:**
- [ ] Criar campo SVG para cada modalidade
- [ ] Implementar drag & drop
- [ ] Criar ferramentas de desenho
- [ ] Implementar salvar/carregar

---

## ✅ CHECKLIST COMPLETO

- [ ] Campo tático interativo
- [ ] Salvar/carregar táticas
- [ ] UI conforme HTML

---

**Última atualização:** 2026-02-27  
**Status:** ⏸️ Planejado


