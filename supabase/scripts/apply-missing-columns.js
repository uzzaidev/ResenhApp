// Aplicar colunas faltantes no Supabase
const postgres = require('postgres');

const url = 'postgresql://postgres.ujrvfkkkssfdhwizjucq:Uzzai2025%40%40@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

const sql = postgres(url, {
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
  ssl: 'require',
  prepare: false,
});

async function applyMissingColumns() {
  console.log('🔧 APLICANDO COLUNAS FALTANTES\n');
  console.log('='.repeat(80));

  try {
    // 1. Verificar se a coluna removed_by_self_at existe
    console.log('\n1️⃣ Verificando coluna removed_by_self_at...');
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'event_attendance'
      AND column_name = 'removed_by_self_at'
    `;

    if (columnCheck.length > 0) {
      console.log('  ✓ Coluna removed_by_self_at JÁ EXISTE');
    } else {
      console.log('  → Coluna removed_by_self_at NÃO EXISTE, adicionando...');

      // Adicionar a coluna
      await sql`
        ALTER TABLE event_attendance
        ADD COLUMN removed_by_self_at TIMESTAMP DEFAULT NULL
      `;
      console.log('  ✓ Coluna removed_by_self_at ADICIONADA');

      // Adicionar comentário
      await sql`
        COMMENT ON COLUMN event_attendance.removed_by_self_at
        IS 'Timestamp quando usuário mudou status de yes para no (auto-remoção)'
      `;
      console.log('  ✓ Comentário adicionado');

      // Adicionar índice
      await sql`
        CREATE INDEX IF NOT EXISTS idx_event_attendance_removed_by_self
        ON event_attendance(removed_by_self_at)
        WHERE removed_by_self_at IS NOT NULL
      `;
      console.log('  ✓ Índice criado');
    }

    // 2. Verificar estrutura final
    console.log('\n2️⃣ Verificando estrutura final da tabela event_attendance...\n');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'event_attendance'
      ORDER BY ordinal_position
    `;

    console.log('Colunas da tabela event_attendance:');
    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '✓ NULL' : '✗ NOT NULL';
      console.log(`  - ${col.column_name.padEnd(25)} ${col.data_type.padEnd(25)} ${nullable}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ COLUNAS APLICADAS COM SUCESSO!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sql.end();
  }
}

applyMissingColumns().catch(err => {
  console.error('\n💥 ERRO FATAL:', err);
  process.exit(1);
});
