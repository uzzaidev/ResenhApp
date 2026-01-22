import { neon } from "@neondatabase/serverless";

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

// Inicialização simples e direta - SEM PROXY
const databaseUrl = getDatabaseUrl();

// Durante build, exporta um placeholder
// Durante runtime, cria a conexão real
export const sql = databaseUrl
  ? neon(databaseUrl)
  : (() => {
      throw new Error("Database URL not configured");
    }) as unknown as ReturnType<typeof neon>;
