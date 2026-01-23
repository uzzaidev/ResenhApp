// Script para fazer backup completo do schema atual do Supabase
const postgres = require('postgres');
const fs = require('fs');

const url = 'postgresql://postgres.ujrvfkkkssfdhwizjucq:Uzzai2025%40%40@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

const sql = postgres(url, {
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
  ssl: 'require',
  prepare: false,
});

async function fullSchemaBackup() {
  console.log('📋 FAZENDO BACKUP COMPLETO DO SCHEMA ATUAL\n');
  console.log('='.repeat(80));

  const backup = {
    timestamp: new Date().toISOString(),
    tables: {},
    views: [],
    materializedViews: [],
    functions: [],
    triggers: [],
    enums: [],
    indexes: [],
    dataCounts: {}
  };

  try {
    // 1. Listar todas as tabelas
    console.log('\n1️⃣ Lendo tabelas...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log(`  → Encontradas ${tables.length} tabelas\n`);

    // 2. Para cada tabela, pegar estrutura E contagem de dados
    for (const { table_name } of tables) {
      console.log(`  → Processando tabela: ${table_name}`);

      // Estrutura
      const columns = await sql`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table_name}
        ORDER BY ordinal_position
      `;

      // Constraints
      const constraints = await sql`
        SELECT
          constraint_name,
          constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = ${table_name}
      `;

      // Foreign keys
      const foreignKeys = await sql`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name = ${table_name}
        AND tc.constraint_type = 'FOREIGN KEY'
      `;

      // Contagem de registros
      let rowCount = 0;
      try {
        const countResult = await sql.unsafe(`SELECT COUNT(*) as count FROM "${table_name}"`);
        rowCount = parseInt(countResult[0].count);
      } catch (e) {
        console.log(`    ⚠️ Erro ao contar registros: ${e.message}`);
      }

      backup.tables[table_name] = {
        columns,
        constraints,
        foreignKeys,
        rowCount
      };

      backup.dataCounts[table_name] = rowCount;

      console.log(`    ✓ ${columns.length} colunas, ${rowCount} registros`);
    }

    // 3. Listar views
    console.log('\n2️⃣ Lendo views...');
    const views = await sql`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
    `;
    backup.views = views.map(v => v.table_name);
    console.log(`  → Encontradas ${views.length} views:`, backup.views.join(', ') || 'Nenhuma');

    // 4. Listar materialized views
    console.log('\n3️⃣ Lendo materialized views...');
    const matViews = await sql`
      SELECT schemaname, matviewname
      FROM pg_matviews
      WHERE schemaname = 'public'
    `;
    backup.materializedViews = matViews.map(v => v.matviewname);
    console.log(`  → Encontradas ${matViews.length} materialized views:`, backup.materializedViews.join(', ') || 'Nenhuma');

    // 5. Listar functions
    console.log('\n4️⃣ Lendo functions...');
    const functions = await sql`
      SELECT
        routine_name,
        routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
    `;
    backup.functions = functions.map(f => ({ name: f.routine_name, type: f.routine_type }));
    console.log(`  → Encontradas ${functions.length} functions`);
    functions.forEach(f => console.log(`      - ${f.routine_name}`));

    // 6. Listar tipos ENUM
    console.log('\n5️⃣ Lendo tipos ENUM...');
    const enums = await sql`
      SELECT
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
    `;
    backup.enums = enums;
    console.log(`  → Encontrados ${enums.length} tipos ENUM`);
    enums.forEach(e => console.log(`      - ${e.enum_name}: ${e.enum_values.join(', ')}`));

    // 7. Listar indexes
    console.log('\n6️⃣ Lendo indexes...');
    const indexes = await sql`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    backup.indexes = indexes;
    console.log(`  → Encontrados ${indexes.length} indexes`);

    // 8. Listar triggers
    console.log('\n7️⃣ Lendo triggers...');
    const triggers = await sql`
      SELECT
        trigger_name,
        event_object_table as table_name,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `;
    backup.triggers = triggers;
    console.log(`  → Encontrados ${triggers.length} triggers`);
    triggers.forEach(t => console.log(`      - ${t.trigger_name} on ${t.table_name}`));

    // 9. Salvar em arquivo JSON
    const backupFilename = `supabase-schema-backup-${Date.now()}.json`;
    fs.writeFileSync(backupFilename, JSON.stringify(backup, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Backup salvo em: ${backupFilename}\n`);

    // 10. Resumo de dados
    console.log('📊 RESUMO DE DADOS:\n');
    console.log('Tabelas com dados:');
    Object.entries(backup.dataCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .forEach(([table, count]) => {
        console.log(`  - ${table.padEnd(30)} ${count.toString().padStart(6)} registros`);
      });

    const totalRecords = Object.values(backup.dataCounts).reduce((a, b) => a + b, 0);
    console.log(`\n  TOTAL: ${totalRecords} registros em ${Object.keys(backup.dataCounts).length} tabelas\n`);

    // 11. Análise de segurança
    console.log('🔒 ANÁLISE DE SEGURANÇA:\n');

    if (totalRecords === 0) {
      console.log('  ✅ SEGURO PARA RESET: Nenhum dado encontrado!');
      console.log('  → Pode prosseguir com o reset sem perda de dados.\n');
    } else if (totalRecords < 10) {
      console.log('  ⚠️  CUIDADO: Poucos dados encontrados (apenas dados de teste?)');
      console.log(`  → ${totalRecords} registros serão PERDIDOS se resetar.`);
      console.log('  → Recomendado: Verifique se são dados importantes.\n');
    } else {
      console.log('  ❌ PERIGO: Muitos dados encontrados!');
      console.log(`  → ${totalRecords} registros serão PERDIDOS se resetar.`);
      console.log('  → RECOMENDADO: Não prosseguir ou fazer backup manual no Supabase.\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sql.end();
  }
}

fullSchemaBackup().catch(err => {
  console.error('\n💥 ERRO FATAL:', err);
  process.exit(1);
});
