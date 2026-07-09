const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://cybervault:cybervault_secret_2024@db:5432/cybervault',
});

const schema = fs.readFileSync('/scripts/init-db.js', 'utf8');

async function initDB() {
  const client = await pool.connect();
  try {
    const schemaMatch = schema.match(/const schema = `([\s\S]*?)`;/);
    if (schemaMatch) {
      await client.query(schemaMatch[1]);
    }
    const templatesMatch = schema.match(/const templates = (\[[\s\S]*?\]);/);
    if (templatesMatch) {
      const templates = eval(templatesMatch[1]);
      for (const t of templates) {
        await client.query(
          'INSERT INTO templates (id, name, icon, content, type, category) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING',
          t
        );
      }
    }
    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
  await pool.end();
}

initDB().catch(console.error);
