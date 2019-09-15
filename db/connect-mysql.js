const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
}

const pool = mysql.createPool(config);

const getConnectionFromPool = async () => {
  const connection = await pool.getConnection(async conn => conn);
  return connection;
}

const getMysqlConnection = async () => {
  try {
    const connection = await getConnectionFromPool();
    connection.connect();
    console.log(`connected mysql`);
    
  } catch (error) {
    console.error(`error occured in mysql connection`);
    process.exit();
  }
}

module.exports = {
  getMysqlConnection,
  pool
}