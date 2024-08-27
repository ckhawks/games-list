import { db } from "./util/db/db";
import { tags } from '../nextjs/src/constants/tags';

// Used to fill the Tag table with all of the tags that Steam returns.

async function populateTagsTable() {
  const values = [];
  const params = [];
  let index = 1;
  for(const tagIdKey in tags) {
    console.log(`${tagIdKey}: ${tags[tagIdKey]}`);
    values.push(`($${index}, $${index + 1})`);
    params.push(tags[tagIdKey]); // name
    params.push(tagIdKey); // steamTagId
    index += 2;
  }

  const insertTagsQuery = `
    INSERT INTO "Tag" (name, "steamTagId") 
    VALUES ${values.join(', ')}
  `;
  try {
    const insertResults = await db(insertTagsQuery, params);
    console.log('Tags inserted successfully!', insertResults);
  } catch (error) {
    console.error('Error inserting tags:', error);
  }

  const checkQuery = `SELECT COUNT(id) as count FROM "Tag";`
  const checkResults = await db(checkQuery, []);
  console.log(`There are ${checkResults[0].count} rows in the Tag table now. Have a good day!`);
}

populateTagsTable()