// MODULE IMPORTATIONS
const mysql = require('mysql2/promise');
const config = require('../config');

// CONNECT TO DB
const query = async(sql,params) => {
    const connection = await mysql.createConnection(config.db);
    const [ results ] = await connection.execute(sql.params);

    return results;
}

// MODULE EXPORTATIONS
module.exports = { query };