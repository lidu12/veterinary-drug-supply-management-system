const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create PostgreSQL Connection Pool
// Supports both cloud connection strings (DATABASE_URL from Neon/Supabase) and discrete local variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'tropical_vet_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected database client error:', err);
});

/**
 * Execute Parameterized SQL Query
 * Safeguards against SQL Injection attacks by parameter binding ($1, $2)
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database Query Error:', {
      message: error.message,
      query: text.substring(0, 100)
    });
    throw error;
  }
};

/**
 * Get dedicated client from pool for atomic transactions (BEGIN / COMMIT / ROLLBACK)
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  const timeout = setTimeout(() => {
    console.error('A database client has been checked out for more than 15 seconds!');
  }, 15000);

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

module.exports = {
  pool,
  query,
  getClient
};
