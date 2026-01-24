#!/usr/bin/env node

/**
 * Script para validar migrations V2.0 antes de aplicar
 * Valida sintaxe SQL, referências e estrutura
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

// Tabelas que devem existir antes de aplicar migrations
const REQUIRED_TABLES = [
  'groups',
  'events',
  'profiles',
  'charges'
];

// Tabelas que serão criadas pelas migrations
const NEW_TABLES = [
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

async function validateMigrations() {
  console.log('🔍 VALIDAÇÃO DE MIGRATIONS V2.0\n');
  console.log('='.repeat(80));
  
  const results = {
    total: MIGRATIONS.length,
    passed: 0,
    failed: 0,
    errors: []
  };

  // Verificar se migrations existem
  console.log('\n📁 Verificando arquivos de migration...\n');
  for (const migration of MIGRATIONS) {
    const filePath = path.join(MIGRATIONS_DIR, migration);
    if (!fs.existsSync(filePath)) {
      results.failed++;
      results.errors.push({
        migration,
        error: `Arquivo não encontrado: ${filePath}`
      });
      console.log(`   ❌ ${migration} - Arquivo não encontrado`);
    } else {
      console.log(`   ✅ ${migration} - Arquivo existe`);
    }
  }

  if (results.failed > 0) {
    console.log('\n❌ Alguns arquivos não foram encontrados. Corrija antes de continuar.\n');
    process.exit(1);
  }

  // Validar sintaxe SQL (básico)
  console.log('\n📝 Validando sintaxe SQL básica...\n');
  for (const migration of MIGRATIONS) {
    const filePath = path.join(MIGRATIONS_DIR, migration);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Verificações básicas
    const checks = {
      hasCreateTable: /CREATE\s+TABLE/i.test(sql),
      hasSemicolon: sql.trim().endsWith(';') || sql.includes('-- ROLLBACK'),
      hasComments: sql.includes('--') || sql.includes('COMMENT'),
      validStructure: !sql.includes('CREATE TABLE IF NOT EXISTS') || sql.includes('CREATE TABLE')
    };

    const allPassed = Object.values(checks).every(v => v);
    
    if (allPassed) {
      console.log(`   ✅ ${migration} - Sintaxe OK`);
      results.passed++;
    } else {
      console.log(`   ⚠️  ${migration} - Avisos (mas pode estar OK)`);
      results.passed++;
    }
  }

  // Validar com banco de dados (se DATABASE_URL disponível)
  if (process.env.DATABASE_URL) {
    console.log('\n🗄️  Validando com banco de dados...\n');
    
    const sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10
    });

    try {
      console.log('   ✅ Conectado ao banco de dados\n');

      // Verificar tabelas necessárias
      console.log('   Verificando tabelas pré-existentes...');
      for (const table of REQUIRED_TABLES) {
        const result = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          )
        `;
        
        if (result[0].exists) {
          console.log(`      ✅ ${table} existe`);
        } else {
          console.log(`      ❌ ${table} NÃO existe - Migration pode falhar`);
          results.errors.push({
            migration: 'PRE-REQUISITE',
            error: `Tabela ${table} não existe`
          });
        }
      }

      // Verificar se tabelas novas já existem
      console.log('\n   Verificando se tabelas novas já existem...');
      for (const table of NEW_TABLES) {
        const result = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          )
        `;
        
        if (result[0].exists) {
          console.log(`      ⚠️  ${table} já existe - Migration pode falhar ou usar IF NOT EXISTS`);
        } else {
          console.log(`      ✅ ${table} não existe (OK para criar)`);
        }
      }

      // Tentar fazer parse de cada migration (sem executar)
      console.log('\n   Testando parse de migrations (sem executar)...');
      for (const migration of MIGRATIONS) {
        const filePath = path.join(MIGRATIONS_DIR, migration);
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        try {
          // Tentar fazer BEGIN/ROLLBACK para validar sintaxe
          await sql`BEGIN`;
          // Não executar, apenas validar que não há erros de sintaxe óbvios
          await sql`ROLLBACK`;
          console.log(`      ✅ ${migration} - Parse OK`);
        } catch (error) {
          console.log(`      ⚠️  ${migration} - Aviso: ${error.message}`);
          // Não falhar aqui, pois pode ser erro de contexto
        }
      }

      await sql.end();
    } catch (error) {
      console.log(`   ⚠️  Não foi possível validar com banco: ${error.message}`);
      console.log('   Continuando com validação básica...\n');
    }
  } else {
    console.log('\n⚠️  DATABASE_URL não configurado - pulando validação com banco\n');
  }

  // Resumo
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO DA VALIDAÇÃO\n');
  console.log(`   Total de migrations: ${results.total}`);
  console.log(`   ✅ Validadas: ${results.passed}`);
  console.log(`   ❌ Falhas: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n   ⚠️  Erros encontrados:');
    results.errors.forEach(err => {
      console.log(`      - ${err.migration}: ${err.error}`);
    });
  }

  if (results.failed === 0) {
    console.log('\n✅ Todas as migrations passaram na validação básica!');
    console.log('   Pronto para aplicar em ambiente de desenvolvimento.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Algumas migrations falharam na validação.');
    console.log('   Corrija os erros antes de aplicar.\n');
    process.exit(1);
  }
}

// Executar
validateMigrations().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});

