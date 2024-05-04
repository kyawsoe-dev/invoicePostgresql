const { Pool } = require('pg');
require('dotenv').config();
const db_port = process.env.DB_PORT;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;
const db_host = process.env.DB_HOST;


const pool = new Pool({
    user: db_user,
    host: db_host,
    database: db_name,
    password: db_password,
    port: db_port
});


module.exports = pool;