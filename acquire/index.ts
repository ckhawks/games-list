import { db } from "./util/db/db";

async function getPgVersion() {
  const result = await db(`SELECT version()`, []);
  console.log(result[0]);
}

// https://steamapi.xpaw.me/#IStoreService/GetMostPopularTags

console.log("hey");
getPgVersion();
