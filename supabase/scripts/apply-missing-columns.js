// Aplicar colunas faltantes no Supabase
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPaths = [
    path.join(__dirname, '..', '..', '.env.local'),
    path.join(__dirname, '..', '..', '.env'),
  ];

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      if (process.env[match[1]]) continue;
      process.env[match[1]] = match[2];
    }
  }
}

loadEnv();
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('SUPABASE_DB_URL ou DATABASE_URL não configurado.');
}

const sql = postgres(dbUrl, {
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
