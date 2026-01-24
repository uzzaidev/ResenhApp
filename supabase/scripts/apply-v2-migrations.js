#!/usr/bin/env node

/**
 * Script para aplicar migrations V2.0 com segurança
 * Aplica uma por uma, valida após cada uma, e registra no banco
 */

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Tentar carregar .env.local manualmente
try {
  const envPath = path.join(__dirname, '..', '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
} catch (e) {
  // Ignorar se não conseguir carregar
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const MIGRATIONS = [
  '20260227000001_sport_modalities.sql',
  '20260227000002_athlete_modalities.sql',
  '20260227000003_recurring_trainings.sql',
  '20260227000004_game_convocations.sql',
  '20260227000005_checkin_qrcodes.sql',
  '20260227000006_saved_tactics.sql',
  '20260227000007_financial_by_training.sql',
  '20260227000008_hierarchy_and_credits.sql'
];

async function createMigrationTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW(),
      applied_by TEXT,
      execution_time_ms INTEGER
    )
  `;
}

async function getAppliedMigrations(sql) {
  const result = await sql`SELECT version FROM schema_migrations ORDER BY version`;
  return result.map(row => row.version);
}

async function registerMigration(sql, migration, executionTime) {
  await sql`
    INSERT INTO schema_migrations (version, applied_at, execution_time_ms) 
    VALUES (${migration}, NOW(), ${executionTime}) 
    ON CONFLICT (version) DO UPDATE SET applied_at = NOW(), execution_time_ms = ${executionTime}
  `;
}

async function validateAfterMigration(sql, migration) {
  const validations = {
    tables: [],
    functions: [],
    views: [],
    columns: []
  };

  // Validar baseado na migration
  if (migration.includes('sport_modalities')) {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sport_modalities'
      )
    `;
    validations.tables.push({ name: 'sport_modalities', exists: result[0].exists });
  }

  if (migration.includes('athlete_modalities')) {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'athlete_modalities'
      )
    `;
    validations.tables.push({ name: 'athlete_modalities', exists: result[0].exists });
  }

  if (migration.includes('hierarchy_and_credits')) {
    // Verificar colunas em groups
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'groups' 
        AND column_name IN ('parent_group_id', 'group_type', 'pix_code', 'credits_balance')
    `;
    validations.columns.push({ table: 'groups', count: result.length, expected: 4 });
    
    // Verificar tabelas
    const tables = ['credit_transactions', 'credit_packages'];
    for (const table of tables) {
      const tableResult = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${table}
        )
      `;
      validations.tables.push({ name: table, exists: tableResult[0].exists });
    }
  }

  return validations;
}

async function applyMigrations() {
  console.log('🚀 APLICAÇÃO DE MIGRATIONS V2.0\n');
  console.log('='.repeat(80));

  // Tentar DATABASE_URL ou SUPABASE_DB_URL
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL ou SUPABASE_DB_URL não configurado!');
    console.error('   Configure no arquivo .env.local\n');
    process.exit(1);
  }

  const sql = postgres(dbUrl, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10
    });

    try {
      console.log('✅ Conectado ao banco de dados\n');

      // Criar tabela de controle
      await createMigrationTable(sql);
      console.log('✅ Tabela de controle criada/verificada\n');

      // Verificar migrations já aplicadas
      const appliedMigrations = await getAppliedMigrations(sql);
    console.log(`📊 Migrations já aplicadas: ${appliedMigrations.length}\n`);

    let appliedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const migration of MIGRATIONS) {
      const filePath = path.join(MIGRATIONS_DIR, migration);
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ ${migration} - Arquivo não encontrado\n`);
        failedCount++;
        continue;
      }

      if (appliedMigrations.includes(migration)) {
        console.log(`⏭️  ${migration} - Já aplicada, pulando...\n`);
        skippedCount++;
        continue;
      }

      console.log(`📄 Aplicando: ${migration}...`);
      const startTime = Date.now();

      try {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        // Executar migration (usar unsafe para múltiplos comandos)
        await sql.unsafe(sqlContent);
        
        const executionTime = Date.now() - startTime;
        
        // Registrar migration
        await registerMigration(sql, migration, executionTime);
        
        // Validar após aplicação
        const validations = await validateAfterMigration(sql, migration);
        
        // Mostrar validações
        if (validations.tables.length > 0) {
          validations.tables.forEach(v => {
            if (v.exists) {
              console.log(`   ✅ Tabela ${v.name} criada`);
            } else {
              console.log(`   ⚠️  Tabela ${v.name} não encontrada após migration`);
            }
          });
        }
        
        if (validations.columns.length > 0) {
          validations.columns.forEach(v => {
            if (v.count === v.expected) {
              console.log(`   ✅ ${v.count}/${v.expected} colunas adicionadas em ${v.table}`);
            } else {
              console.log(`   ⚠️  Apenas ${v.count}/${v.expected} colunas encontradas em ${v.table}`);
            }
          });
        }
        
        console.log(`   ✅ Aplicada com sucesso! (${executionTime}ms)\n`);
        appliedCount++;
        
      } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`   ❌ ERRO: ${error.message}`);
        console.error(`   Tempo: ${executionTime}ms\n`);
        failedCount++;
        
        // Perguntar se deve continuar
        console.log('   ⚠️  Migration falhou. Deseja continuar com as próximas?');
        console.log('   (Script continuará automaticamente, mas migration não foi aplicada)\n');
        
        // Não fazer rollback automático, deixar para o usuário decidir
      }
    }

    // Resumo final
    console.log('='.repeat(80));
    console.log('📊 RESUMO DA APLICAÇÃO\n');
    console.log(`   Total de migrations: ${MIGRATIONS.length}`);
    console.log(`   ✅ Aplicadas agora: ${appliedCount}`);
    console.log(`   ⏭️  Já aplicadas (puladas): ${skippedCount}`);
    console.log(`   ❌ Falhas: ${failedCount}\n`);

    if (failedCount === 0) {
      console.log('✅ Todas as migrations foram aplicadas com sucesso!\n');
      
      // Validar integridade final
      console.log('🔍 Validando integridade final...\n');
      await validateFinalIntegrity(sql);
      
    } else {
      console.log('⚠️  Algumas migrations falharam.');
      console.log('   Revise os erros acima e corrija antes de continuar.\n');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

async function validateFinalIntegrity(sql) {
  const checks = {
    tables: 0,
    functions: 0,
    views: 0
  };

  // Verificar tabelas novas
  const newTables = [
    'sport_modalities',
    'athlete_modalities',
    'credit_transactions',
    'credit_packages',
    'game_convocations',
    'convocation_responses',
    'checkin_qrcodes',
    'checkins',
    'saved_tactics'
  ];

  for (const table of newTables) {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = ${table}
      )
    `;
    
    if (result[0].exists) {
      checks.tables++;
      console.log(`   ✅ Tabela ${table} existe`);
    } else {
      console.log(`   ❌ Tabela ${table} NÃO existe`);
    }
  }

  // Verificar funções críticas
  const criticalFunctions = [
    'consume_credits',
    'add_credits',
    'get_pix_code_for_group',
    'can_manage_group'
  ];

  for (const func of criticalFunctions) {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = ${func}
      )
    `;
    
    if (result[0].exists) {
      checks.functions++;
      console.log(`   ✅ Função ${func} existe`);
    } else {
      console.log(`   ❌ Função ${func} NÃO existe`);
    }
  }

  // Verificar views
  const views = ['v_training_payments', 'v_training_payment_details'];
  for (const view of views) {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' AND table_name = ${view}
      )
    `;
    
    if (result[0].exists) {
      checks.views++;
      console.log(`   ✅ View ${view} existe`);
    } else {
      console.log(`   ❌ View ${view} NÃO existe`);
    }
  }

  console.log(`\n   📊 Validação: ${checks.tables}/9 tabelas, ${checks.functions}/4 funções, ${checks.views}/2 views\n`);
  
  if (checks.tables === 9 && checks.functions === 4 && checks.views === 2) {
    console.log('✅ Integridade validada com sucesso!\n');
  } else {
    console.log('⚠️  Algumas validações falharam. Revise acima.\n');
  }
}

// Executar
applyMigrations().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});

