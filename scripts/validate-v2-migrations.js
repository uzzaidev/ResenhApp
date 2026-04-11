#!/usr/bin/env node
/**
 * Script de Validação das Migrations V2.0
 * 
 * Valida sintaxe SQL e referências das migrations antes de aplicar
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const migrations = [
  '20260227000001_sport_modalities.sql',
  '20260227000002_athlete_modalities.sql',
  '20260227000003_recurring_trainings.sql',
  '20260227000004_game_convocations.sql',
  '20260227000005_checkin_qrcodes.sql',
  '20260227000006_saved_tactics.sql',
  '20260227000007_financial_by_training.sql',
  '20260227000008_hierarchy_and_credits.sql'
];

async function validateMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');
    console.log('🔍 Validando migrations V2.0...\n');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const migration of migrations) {
      const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);
      
      if (!fs.existsSync(filePath)) {
        console.error(`❌ ${migration} - Arquivo não encontrado\n`);
        errorCount++;
        errors.push({ migration, error: 'Arquivo não encontrado' });
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`📄 Validando: ${migration}...`);
      
      try {
        // Tentar fazer parse (não executar)
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('ROLLBACK');
        console.log(`   ✅ ${migration} - OK\n`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ ${migration} - ERRO: ${error.message}\n`);
        errorCount++;
        errors.push({ migration, error: error.message });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 RESUMO:`);
    console.log(`   ✅ Sucesso: ${successCount}/${migrations.length}`);
    console.log(`   ❌ Erros: ${errorCount}/${migrations.length}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:\n');
      errors.forEach(({ migration, error }) => {
        console.log(`   ${migration}:`);
        console.log(`   ${error}\n`);
      });
      process.exit(1);
    } else {
      console.log('\n✅ Todas as migrations são válidas!');
      console.log('💡 Próximo passo: Aplicar as migrations em ambiente de desenvolvimento');
    }
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
    console.error('\n💡 Verifique se:');
    console.error('   1. DATABASE_URL está configurado no .env.local');
    console.error('   2. O banco de dados está acessível');
    console.error('   3. As migrations anteriores foram aplicadas');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executar validação
validateMigrations();






