const mysql = require("mysql2/promise");

async function main(){
  const db = await mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_APPUSER,
    dateStrings: 'date'
  });
  // const record = await userDB.query("SELECT * FROM user");
  // console.log(record[0]);
  // console.log("userDB: ", userDB);
  return db;
}

module.exports = main;



