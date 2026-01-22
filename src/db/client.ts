import { neon } from "@neondatabase/serverless";

// Suporta tanto SUPABASE_DB_URL (novo) quanto DATABASE_URL (legado/Neon)
function getDatabaseUrl() {
  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  
  // Durante o build, não lançamos erro - será validado em runtime
  if (!databaseUrl && typeof process !== 'undefined' && process.env) {
    // Runtime sem variável - lança erro
    throw new Error(
      "DATABASE_URL ou SUPABASE_DB_URL não está definida. " +
      "Configure SUPABASE_DB_URL para Supabase ou DATABASE_URL para Neon no .env.local"
    );
  }
  
  // Build time - retorna string vazia, será validado em runtime
  return databaseUrl || '';
}

// Lazy initialization - só cria a conexão quando for usada (runtime)
let sqlInstance: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sqlInstance) {
    const url = getDatabaseUrl();
    if (!url) {
      // Build time - retorna um mock que nunca será executado
      // Em runtime, getDatabaseUrl() já teria lançado erro
      return {} as ReturnType<typeof neon>;
    }
    sqlInstance = neon(url);
  }
  return sqlInstance;
}

// Export como Proxy que inicializa lazy, mantendo tipos
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_target, prop) {
    const sql = getSql();
    const value = (sql as any)[prop];
    return typeof value === 'function' ? value.bind(sql) : value;
  },
}) as ReturnType<typeof neon>;
