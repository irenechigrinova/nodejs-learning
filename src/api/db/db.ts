const { Pool } = require('pg');
const dbConfig = require('./config');

const pool = new Pool(dbConfig);

async function query(query: string, params: unknown[]) {
  if (!dbConfig.user || !dbConfig.password) {
    throw new Error('Cannot connect to DB: need credentials');
  }
  const { rows } = await pool.query(query, params);

  return rows;
}

module.exports = {
  query,
};
