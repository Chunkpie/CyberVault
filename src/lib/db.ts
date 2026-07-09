import { Pool, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://cybervault:cybervault_secret_2024@localhost:5432/cybervault',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

function toCamel(row: QueryResultRow): Record<string, any> {
  if (!row) return row;
  const out: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = row[key];
  }
  return out;
}

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function get(text: string, params?: any[]) {
  const result = await query(text, params);
  return result.rows.length > 0 ? toCamel(result.rows[0]) : null;
}

export async function getAll(text: string, params?: any[]) {
  const result = await query(text, params);
  return result.rows.map(toCamel);
}

export async function run(text: string, params?: any[]) {
  await query(text, params);
}

export default pool;
