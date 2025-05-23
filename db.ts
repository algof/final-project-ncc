import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const dbHost = "localhost";
const dbPort = "3306";
const dbUser = "root";
const dbPassword = "";
const dbName = "chat_app";

const client = await new Client().connect({
  hostname: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  db: dbName,
});

export default client;