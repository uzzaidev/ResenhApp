// Script para resetar o Supabase e aplicar o schema correto
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
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require',
  prepare: false,
});

async function resetDatabase() {
  console.log('🔥 RESETANDO O BANCO DE DADOS SUPABASE\n');
  console.log('='.repeat(80));

  try {
    // 1. Dropar todas as triggers
    console.log('\n1️⃣ Dropando triggers...');
    await sql`DROP TRIGGER IF EXISTS trigger_refresh_scoreboard ON event_actions CASCADE`;
    console.log('  ✓ Triggers removidos');

    // 2. Dropar todas as materialized views
    console.log('\n2️⃣ Dropando materialized views...');
    await sql`DROP MATERIALIZED VIEW IF EXISTS mv_event_scoreboard CASCADE`;
    console.log('  ✓ Materialized views removidos');

    // 3. Dropar todas as functions
    console.log('\n3️⃣ Dropando functions...');
    await sql`DROP FUNCTION IF EXISTS refresh_event_scoreboard() CASCADE`;
    await sql`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`;
    console.log('  ✓ Functions removidos');

    // 4. Dropar todas as views
    console.log('\n4️⃣ Dropando views...');
    await sql`DROP VIEW IF EXISTS active_groups CASCADE`;
    await sql`DROP VIEW IF EXISTS active_group_members CASCADE`;
    console.log('  ✓ Views removidos');

    // 5. Dropar todas as tabelas (em ordem reversa de dependências)
    console.log('\n5️⃣ Dropando todas as tabelas...');
    const tablesToDrop = [
      'event_settings', 'draw_configs', 'charges', 'wallets', 'invites',
      'player_ratings', 'event_actions', 'team_members', 'teams',
      'event_attendance', 'events', 'venues', 'group_members', 'groups',
      'user_achievements', 'user_badges', 'badges', 'achievement_types',
      'milestones', 'leaderboards', 'player_stats', 'group_stats', 'event_stats',
      'notifications', 'notification_batches', 'notification_templates',
      'push_tokens', 'email_queue', 'activity_log',
      'pix_payments', 'group_pix_config', 'transactions',
      'challenge_participants', 'challenges', 'charge_splits',
      'votes', 'profiles', 'user_roles', 'users'
    ];

    for (const table of tablesToDrop) {
      try {
        await sql`DROP TABLE IF EXISTS ${sql(table)} CASCADE`;
        console.log(`  ✓ Dropou tabela: ${table}`);
      } catch (e) {
        // Ignora erros de tabelas que não existem
      }
    }

    // 6. Dropar tipos ENUM se existirem
    console.log('\n6️⃣ Dropando tipos ENUM...');
    const enumTypes = [
      'sport_modality', 'privacy_type', 'charge_status',
      'event_status', 'attendance_status'
    ];

    for (const enumType of enumTypes) {
      try {
        await sql`DROP TYPE IF EXISTS ${sql(enumType)} CASCADE`;
        console.log(`  ✓ Dropou tipo: ${enumType}`);
      } catch (e) {
        // Ignora erros
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Banco resetado com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao resetar:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

async function applySchema() {
  console.log('\n📄 APLICANDO SCHEMA CORRETO\n');
  console.log('='.repeat(80));

  try {
    // Ler o arquivo schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'src', 'db', 'migrations', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('\n→ Executando schema.sql...\n');

    // Executar o schema SQL
    // Nota: Como o schema tem múltiplos comandos, vamos executar via unsafe
    await sql.unsafe(schemaSQL);

    console.log('\n='.repeat(80));
    console.log('✅ Schema aplicado com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao aplicar schema:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

async function verifySchema() {
  console.log('\n🔍 VERIFICANDO SCHEMA APLICADO\n');
  console.log('='.repeat(80));

  try {
    // Verificar tabelas criadas
    console.log('\n→ Verificando tabelas...\n');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log('Tabelas criadas:');
    tables.forEach(t => console.log(`  ✓ ${t.table_name}`));

    // Verificar colunas da tabela groups
    console.log('\n→ Verificando estrutura da tabela groups...\n');
    const groupsCols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'groups'
      ORDER BY ordinal_position
    `;

    console.log('Colunas da tabela groups:');
    groupsCols.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '✓ NULL' : '✗ NOT NULL';
      console.log(`  - ${col.column_name.padEnd(20)} ${col.data_type.padEnd(25)} ${nullable}`);
    });

    // Verificar colunas da tabela events
    console.log('\n→ Verificando estrutura da tabela events...\n');
    const eventsCols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'events'
      ORDER BY ordinal_position
    `;

    console.log('Colunas da tabela events:');
    eventsCols.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '✓ NULL' : '✗ NOT NULL';
      console.log(`  - ${col.column_name.padEnd(20)} ${col.data_type.padEnd(25)} ${nullable}`);
    });

    // Verificar colunas da tabela charges
    console.log('\n→ Verificando estrutura da tabela charges...\n');
    const chargesCols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'charges'
      ORDER BY ordinal_position
    `;

    console.log('Colunas da tabela charges:');
    chargesCols.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '✓ NULL' : '✗ NOT NULL';
      console.log(`  - ${col.column_name.padEnd(20)} ${col.data_type.padEnd(25)} ${nullable}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Verificação concluída!\n');

  } catch (error) {
    console.error('❌ Erro ao verificar:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await resetDatabase();
    await applySchema();
    await verifySchema();

    console.log('\n' + '🎉'.repeat(40));
    console.log('\n✅ SUCESSO TOTAL! Schema resetado e aplicado corretamente!\n');
    console.log('Próximo passo: Testar criação de grupo em produção\n');

  } catch (error) {
    console.error('\n💥 ERRO FATAL:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
