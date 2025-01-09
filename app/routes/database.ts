const mysql = require("mysql2/promise");

// Add your environment variables to a .env file. Credentials should not be hard-coded in the application. It is a security risk.

const envDBConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// Database connection configuration
// Credentials should be stored in an environment variable, example above
const dbConfig = {
  host: envDBConfig.host ?? "dragon.kent.ac.uk",
  user: envDBConfig.user ?? "comp6000_06",
  password: envDBConfig.password ?? "oladid_",
  database: envDBConfig.database ?? "comp6000_06",
};

// Create a database connection pool
const pool = mysql.createPool(dbConfig);

// Execute a query and return a promise
export async function executeQuery(query: string, values: any[]) {
  const connection = await pool.getConnection();
  try {
    const [rows, fields] = await connection.execute(query, values);
    return rows;
  } finally {
    connection.release();
  }
}
