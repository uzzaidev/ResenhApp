// Script completo de auditoria do database
const postgres = require('postgres');
const fs = require('fs');

const url = 'postgresql://postgres.ujrvfkkkssfdhwizjucq:Uzzai2025%40%40@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

const sql = postgres(url, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require',
  prepare: false,
});

async function fullDatabaseAudit() {
  console.log('🔍 AUDITORIA COMPLETA DO DATABASE\n');
  console.log('='.repeat(100));

  const audit = {
    timestamp: new Date().toISOString(),
    database: 'ResenhApp - Supabase',
    summary: {},
    tables: {},
    relationships: [],
    indexes: [],
    constraints: [],
    potentialIssues: [],
    recommendations: []
  };

  try {
    // 1. LISTAR TODAS AS TABELAS
    console.log('\n📋 1. MAPEANDO TABELAS\n');
    const tables = await sql`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_stat_get_live_tuples(c.oid) as row_count
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    audit.summary.totalTables = tables.length;
    console.log(`   Encontradas ${tables.length} tabelas\n`);

    // 2. DETALHES DE CADA TABELA
    console.log('📊 2. ANALISANDO ESTRUTURA DE CADA TABELA\n');

    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`   → ${tableName}...`);

      // Colunas
      const columns = await sql`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          datetime_precision
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      // Primary Keys
      const primaryKeys = await sql`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = ${tableName}::regclass
        AND i.indisprimary
      `;

      // Foreign Keys
      const foreignKeys = await sql`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule,
          rc.update_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
        AND tc.constraint_type = 'FOREIGN KEY'
      `;

      // Indexes específicos da tabela
      const tableIndexes = await sql`
        SELECT
          i.relname as index_name,
          a.attname as column_name,
          am.amname as index_type,
          ix.indisunique as is_unique,
          ix.indisprimary as is_primary
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_am am ON i.relam = am.oid
        LEFT JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE t.relkind = 'r'
        AND t.relname = ${tableName}
        ORDER BY i.relname
      `;

      // Unique Constraints
      const uniqueConstraints = await sql`
        SELECT
          tc.constraint_name,
          kcu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
        AND tc.constraint_type = 'UNIQUE'
      `;

      // Check Constraints
      const checkConstraints = await sql`
        SELECT
          tc.constraint_name,
          cc.check_clause
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.check_constraints AS cc
          ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
        AND tc.constraint_type = 'CHECK'
      `;

      audit.tables[tableName] = {
        size: table.size,
        rowCount: parseInt(table.row_count) || 0,
        columns: columns.map(c => ({
          name: c.column_name,
          type: c.data_type,
          nullable: c.is_nullable === 'YES',
          default: c.column_default,
          maxLength: c.character_maximum_length,
          precision: c.numeric_precision
        })),
        primaryKeys: primaryKeys.map(pk => pk.attname),
        foreignKeys: foreignKeys.map(fk => ({
          constraintName: fk.constraint_name,
          column: fk.column_name,
          referencedTable: fk.foreign_table_name,
          referencedColumn: fk.foreign_column_name,
          onDelete: fk.delete_rule,
          onUpdate: fk.update_rule
        })),
        indexes: tableIndexes.map(idx => ({
          name: idx.index_name,
          column: idx.column_name,
          type: idx.index_type,
          unique: idx.is_unique,
          primary: idx.is_primary
        })),
        uniqueConstraints: uniqueConstraints.map(uc => ({
          name: uc.constraint_name,
          column: uc.column_name
        })),
        checkConstraints: checkConstraints.map(cc => ({
          name: cc.constraint_name,
          clause: cc.check_clause
        }))
      };

      // Adicionar relacionamentos ao mapa global
      foreignKeys.forEach(fk => {
        audit.relationships.push({
          from: tableName,
          fromColumn: fk.column_name,
          to: fk.foreign_table_name,
          toColumn: fk.foreign_column_name,
          onDelete: fk.delete_rule,
          onUpdate: fk.update_rule
        });
      });
    }

    // 3. VERIFICAR INTEGRIDADE
    console.log('\n\n🔍 3. VERIFICANDO INTEGRIDADE\n');

    // Verificar tabelas órfãs (sem FK e sem ser referenciada)
    const allReferencedTables = new Set();
    const allReferencingTables = new Set();
    audit.relationships.forEach(rel => {
      allReferencedTables.add(rel.to);
      allReferencingTables.add(rel.from);
    });

    tables.forEach(table => {
      const tableName = table.tablename;
      if (!allReferencedTables.has(tableName) && !allReferencingTables.has(tableName)) {
        if (tableName !== 'users' && tableName !== 'spatial_ref_sys') {
          audit.potentialIssues.push({
            type: 'ORPHAN_TABLE',
            severity: 'WARNING',
            table: tableName,
            message: `Tabela ${tableName} não tem relacionamentos com outras tabelas`
          });
        }
      }
    });

    // Verificar colunas sem índice em FKs
    Object.entries(audit.tables).forEach(([tableName, tableData]) => {
      tableData.foreignKeys.forEach(fk => {
        const hasIndex = tableData.indexes.some(idx => idx.column === fk.column);
        if (!hasIndex) {
          audit.potentialIssues.push({
            type: 'MISSING_INDEX_ON_FK',
            severity: 'PERFORMANCE',
            table: tableName,
            column: fk.column,
            message: `Foreign key ${fk.column} não tem índice, pode impactar performance`
          });
        }
      });
    });

    // Verificar tabelas sem PK
    Object.entries(audit.tables).forEach(([tableName, tableData]) => {
      if (tableData.primaryKeys.length === 0) {
        audit.potentialIssues.push({
          type: 'NO_PRIMARY_KEY',
          severity: 'CRITICAL',
          table: tableName,
          message: `Tabela ${tableName} não tem chave primária`
        });
      }
    });

    // Verificar colunas TEXT sem limite
    Object.entries(audit.tables).forEach(([tableName, tableData]) => {
      tableData.columns.forEach(col => {
        if (col.type === 'text' && !col.maxLength && col.name !== 'description' && col.name !== 'address' && col.name !== 'metadata') {
          audit.potentialIssues.push({
            type: 'UNBOUNDED_TEXT',
            severity: 'INFO',
            table: tableName,
            column: col.name,
            message: `Coluna ${col.name} é TEXT sem limite, considere VARCHAR(n) se houver limite esperado`
          });
        }
      });
    });

    // 4. RECOMENDAÇÕES
    console.log('\n💡 4. GERANDO RECOMENDAÇÕES\n');

    // Recomendar índices compostos para queries comuns
    if (audit.tables.event_attendance) {
      const hasCompositeIndex = audit.tables.event_attendance.indexes.some(
        idx => idx.name && (idx.name.includes('event_id') || idx.name.includes('user_id'))
      );
      if (!hasCompositeIndex) {
        audit.recommendations.push({
          type: 'ADD_COMPOSITE_INDEX',
          priority: 'MEDIUM',
          table: 'event_attendance',
          suggestion: 'CREATE INDEX idx_event_attendance_event_user ON event_attendance(event_id, user_id)',
          reason: 'Queries frequentes filtram por event_id e user_id juntos'
        });
      }
    }

    // Recomendar partial indexes para soft delete
    if (audit.tables.groups?.columns.some(c => c.name === 'deleted_at')) {
      const hasPartialIndex = audit.tables.groups.indexes.some(
        idx => idx.name && idx.name.includes('deleted')
      );
      if (!hasPartialIndex) {
        audit.recommendations.push({
          type: 'ADD_PARTIAL_INDEX',
          priority: 'LOW',
          table: 'groups',
          suggestion: 'CREATE INDEX idx_groups_active ON groups(id) WHERE deleted_at IS NULL',
          reason: 'Otimiza queries que filtram apenas grupos ativos'
        });
      }
    }

    // 5. ESTATÍSTICAS GERAIS
    audit.summary.totalColumns = Object.values(audit.tables).reduce((sum, t) => sum + t.columns.length, 0);
    audit.summary.totalRelationships = audit.relationships.length;
    audit.summary.totalIndexes = Object.values(audit.tables).reduce((sum, t) => sum + t.indexes.length, 0);
    audit.summary.totalRows = Object.values(audit.tables).reduce((sum, t) => sum + t.rowCount, 0);
    audit.summary.criticalIssues = audit.potentialIssues.filter(i => i.severity === 'CRITICAL').length;
    audit.summary.performanceIssues = audit.potentialIssues.filter(i => i.severity === 'PERFORMANCE').length;
    audit.summary.warnings = audit.potentialIssues.filter(i => i.severity === 'WARNING').length;

    // 6. SALVAR RELATÓRIO
    const auditFilename = `supabase/docs/database-audit-${Date.now()}.json`;
    fs.writeFileSync(auditFilename, JSON.stringify(audit, null, 2));

    console.log('\n' + '='.repeat(100));
    console.log('\n📊 RESUMO DA AUDITORIA:\n');
    console.log(`   Tabelas:              ${audit.summary.totalTables}`);
    console.log(`   Colunas:              ${audit.summary.totalColumns}`);
    console.log(`   Relacionamentos:      ${audit.summary.totalRelationships}`);
    console.log(`   Índices:              ${audit.summary.totalIndexes}`);
    console.log(`   Total de registros:   ${audit.summary.totalRows.toLocaleString()}`);
    console.log('');
    console.log('   🚨 Issues críticos:   ', audit.summary.criticalIssues);
    console.log('   ⚡ Issues performance:', audit.summary.performanceIssues);
    console.log('   ⚠️  Warnings:          ', audit.summary.warnings);
    console.log('   💡 Recomendações:     ', audit.recommendations.length);
    console.log('');
    console.log(`✅ Relatório salvo em: ${auditFilename}\n`);

    return audit;

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sql.end();
  }
}

fullDatabaseAudit().catch(err => {
  console.error('\n💥 ERRO FATAL:', err);
  process.exit(1);
});
