// Script de debug de conexao com Supabase
// Execute com: node supabase/scripts/test-db-connection.js

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

async function runTest() {
  loadEnv();

  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL ou DATABASE_URL nao configurado.');
    process.exit(1);
  }

  console.log('INICIANDO TESTE DE CONEXAO COM SUPABASE');
  console.log('='.repeat(60));
  console.log(`URL: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);

  let sql;
  try {
    sql = postgres(dbUrl, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
      ssl: 'require',
      prepare: false,
      onnotice: () => {},
    });

    await sql`SELECT 1 as test`;
    console.log('OK: ping no banco');

    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as exists
    `;
    console.log(`OK: tabela users existe = ${tableCheck[0].exists}`);

    if (tableCheck[0].exists) {
      const count = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`OK: total de usuarios = ${count[0].count}`);
    }

    console.log('SUCESSO: conexao validada.');
  } catch (error) {
    console.error(`ERRO: ${error.message}`);
    if (error.code) console.error(`Codigo: ${error.code}`);
    process.exitCode = 1;
  } finally {
    if (sql) await sql.end();
  }
}

runTest().catch((err) => {
  console.error('ERRO FATAL:', err);
  process.exit(1);
});