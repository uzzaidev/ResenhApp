// Script para verificar o schema atual do Supabase
const postgres = require('postgres');

const url = 'postgresql://postgres.ujrvfkkkssfdhwizjucq:Uzzai2025%40%40@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

const sql = postgres(url, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 10,
  ssl: 'require',
  prepare: false,
});

async function checkSchema() {
  console.log('🔍 Verificando schema do Supabase\n');
  console.log('='.repeat(80));

  try {
    // Verificar colunas da tabela groups
    console.log('\n📋 Tabela: GROUPS');
    console.log('-'.repeat(80));
    const groupsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'groups'
      ORDER BY ordinal_position
    `;

    console.log('Colunas encontradas:');
    groupsColumns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '✓ NULL' : '✗ NOT NULL';
      console.log(`  - ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}`);
    });

    // Verificar colunas da tabela charges
    console.log('\n📋 Tabela: CHARGES');
    console.log('-'.repeat(80));
    const chargesColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'charges'
      ORDER BY ordinal_position
    `;

    if (chargesColumns.length === 0) {
      console.log('❌ Tabela charges NÃO EXISTE!');
    } else {
      console.log('Colunas encontradas:');
      chargesColumns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '✓ NULL' : '✗ NOT NULL';
        console.log(`  - ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}`);
      });
    }

    // Verificar colunas da tabela events
    console.log('\n📋 Tabela: EVENTS');
    console.log('-'.repeat(80));
    const eventsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'events'
      ORDER BY ordinal_position
    `;

    if (eventsColumns.length === 0) {
      console.log('❌ Tabela events NÃO EXISTE!');
    } else {
      console.log('Colunas encontradas:');
      eventsColumns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '✓ NULL' : '✗ NOT NULL';
        console.log(`  - ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}`);
      });
    }

    // Listar todas as tabelas
    console.log('\n📋 TODAS AS TABELAS NO SCHEMA PUBLIC:');
    console.log('-'.repeat(80));
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    tables.forEach(t => console.log(`  - ${t.table_name}`));

    console.log('\n' + '='.repeat(80));
    console.log('✅ Verificação concluída!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sql.end();
  }
}

checkSchema();
