// Script de Debug de Conexão com Supabase
// Execute com: node test-db-connection.js

const postgres = require('postgres');

console.log('🔍 INICIANDO DEBUG DE CONEXÃO COM SUPABASE\n');
console.log('=' .repeat(60));

// Lista de URLs para testar
const urlsToTest = [
  {
    name: 'Transaction Pooler (6543)',
    url: 'postgresql://postgres.ujrvfkkkssfdhwizjucq:Uzzai2025@@@@aws-1-us-east-2.pooler.supabase.co:6543/postgres'
  },
  {
    name: 'Session Pooler (5432)',
    url: 'postgresql://postgres.ujrvfkkkssfdhwizjucq:Uzzai2025@@@@aws-1-us-east-2.pooler.supabase.co:5432/postgres'
  },
  {
    name: 'Direct Connection (5432)',
    url: 'postgresql://postgres.ujrvfkkkssfdhwizjucq:Uzzai2025@@@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
  },
  {
    name: 'Direct Connection alt (6543)',
    url: 'postgresql://postgres.ujrvfkkkssfdhwizjucq:Uzzai2025@@@@aws-0-sa-east-1.pooler.supabase.com:6543/postgres'
  }
];

async function testConnection(name, url) {
  console.log(`\n📡 Testando: ${name}`);
  console.log(`URL: ${url.replace(/:[^:@]+@/, ':***@')}`); // Hide password

  let sql;

  try {
    // Criar conexão
    sql = postgres(url, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
      ssl: 'require',
      prepare: false,
      onnotice: () => {}, // Silenciar avisos
    });

    console.log('  ✓ Conexão criada');

    // Teste 1: Ping básico
    console.log('  → Testando ping...');
    await sql`SELECT 1 as test`;
    console.log('  ✓ Ping OK');

    // Teste 2: Verificar se tabela users existe
    console.log('  → Verificando tabela users...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as exists
    `;
    console.log(`  ✓ Tabela users existe: ${tableCheck[0].exists}`);

    // Teste 3: Contar usuários
    console.log('  → Contando usuários...');
    const count = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`  ✓ Total de usuários: ${count[0].count}`);

    // Teste 4: Testar INSERT
    console.log('  → Testando INSERT...');
    const testEmail = `teste_${Date.now()}@debug.com`;
    try {
      const inserted = await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES ('Teste Debug', ${testEmail}, 'hash_teste')
        RETURNING id, email
      `;
      console.log(`  ✓ INSERT OK - ID: ${inserted[0].id}`);

      // Limpar teste
      await sql`DELETE FROM users WHERE email = ${testEmail}`;
      console.log('  ✓ Limpeza OK');
    } catch (insertError) {
      console.log(`  ✗ INSERT falhou: ${insertError.message}`);
      if (insertError.code) console.log(`    Código: ${insertError.code}`);
      if (insertError.detail) console.log(`    Detalhe: ${insertError.detail}`);
    }

    console.log(`\n✅ ${name} - FUNCIONOU!\n`);

    await sql.end();
    return true;

  } catch (error) {
    console.log(`\n❌ ${name} - FALHOU`);
    console.log(`  Erro: ${error.message}`);
    if (error.code) console.log(`  Código: ${error.code}`);
    if (error.errno) console.log(`  Errno: ${error.errno}`);
    if (error.hostname) console.log(`  Hostname: ${error.hostname}`);

    if (sql) {
      try {
        await sql.end();
      } catch (e) {
        // Ignore
      }
    }

    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 Iniciando testes em sequência...\n');

  let successCount = 0;

  for (const test of urlsToTest) {
    const success = await testConnection(test.name, test.url);
    if (success) successCount++;

    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTADO FINAL: ${successCount}/${urlsToTest.length} conexões funcionaram\n`);

  if (successCount === 0) {
    console.log('❌ NENHUMA CONEXÃO FUNCIONOU!\n');
    console.log('Possíveis causas:');
    console.log('  1. Senha incorreta');
    console.log('  2. IP não autorizado no Supabase');
    console.log('  3. Database URL incorreta');
    console.log('  4. Firewall bloqueando');
    console.log('\n💡 Próximo passo: Verificar configurações no Supabase Dashboard');
  }
}

// Executar
runAllTests().catch(err => {
  console.error('\n💥 ERRO FATAL:', err);
  process.exit(1);
});
