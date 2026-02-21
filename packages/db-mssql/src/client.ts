import sql from "mssql";
import { Sequelize } from "sequelize";
import { getMssqlEnvConfig } from "./config.js";

let connection: any = null;
let sequelizeReady = false;

const mssqlConfig = getMssqlEnvConfig();

const sequelize = new Sequelize(mssqlConfig.database, mssqlConfig.user, mssqlConfig.password, {
  host: mssqlConfig.server,
  port: mssqlConfig.port,
  dialect: mssqlConfig.dialect,
  dialectOptions: mssqlConfig.dialectOptions,
  logging: false
});

export default sequelize;

export async function getMssqlSequelize() {
  if (!sequelizeReady) {
    await sequelize.authenticate();
    sequelizeReady = true;
  }
  return sequelize;
}

export async function getMssqlConnection() {
  if (connection) return connection;

  connection = await sql.connect({
    server: mssqlConfig.server,
    user: mssqlConfig.user,
    password: mssqlConfig.password,
    database: mssqlConfig.database,
    port: mssqlConfig.port,
    options: mssqlConfig.dialectOptions.options
  });

  return connection;
}
