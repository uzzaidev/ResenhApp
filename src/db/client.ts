import postgres from 'postgres';

// Suporta tanto SUPABASE_DB_URL (novo) quanto DATABASE_URL (legado/Neon)
function getDatabaseUrl() {
  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  // Durante o build, retorna string vazia (será validado em runtime)
  if (!databaseUrl) {
    // Em runtime (quando há process.env populado), lança erro
    if (typeof window === 'undefined' && process.env && Object.keys(process.env).length > 0) {
      throw new Error(
        "DATABASE_URL ou SUPABASE_DB_URL não está definida. " +
        "Configure SUPABASE_DB_URL para Supabase ou DATABASE_URL para Neon"
      );
    }
    return '';
  }

  return databaseUrl;
}

// Inicialização com postgres
const databaseUrl = getDatabaseUrl();

// Durante build, exporta um placeholder
// Durante runtime, cria a conexão real com configuração para Supabase
export const sql = databaseUrl
  ? postgres(databaseUrl, {
      // Configurações otimizadas para Supabase + Vercel
      max: 10, // Máximo de conexões no pool
      idle_timeout: 20, // Fechar conexões idle após 20s
      connect_timeout: 10, // Timeout de conexão: 10s
      ssl: 'require', // Forçar SSL
      prepare: false, // Desabilitar prepared statements (necessário para pooler)
    })
  : (() => {
      throw new Error("Database URL not configured");
    }) as unknown as ReturnType<typeof postgres>;
