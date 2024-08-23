require("dotenv").config();
import { db } from "./util/db/db";

import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import getS3Client from "./util/s3/GetS3Client";
import { checkIfKeyExists } from "./util/s3/CheckIfS3ObjectExists";

console.log("Starting up GAME DATA ACQUIRER V1");
console.log("   Written by DeadNotSleeping    ");
console.log("          (very epic)            ");
console.log("");
console.log("Reading player and ratings data from ratings.json...");
console.log("");
import data from './data/ratings.json';

// https://steamapi.xpaw.me/#IStoreBrowseService/GetItems
// https://steamdb.info/app/427520/subs/


// https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?access_token=eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInI6MTcxQl8yNDkzRTBEQ19DMjJERCIsICJzdWIiOiAiNzY1NjExOTgwMTQyNjE0MTAiLCAiYXVkIjogWyAid2ViOnN0b3JlIiBdLCAiZXhwIjogMTcyNDI4NjY2MCwgIm5iZiI6IDE3MTU1NTk5NjMsICJpYXQiOiAxNzI0MTk5OTYzLCAianRpIjogIjBGMkNfMjRFRUJENjhfMEYzQjEiLCAib2F0IjogMTcxODQxODE0NiwgInJ0X2V4cCI6IDE3MzY4MjAyMTQsICJwZXIiOiAwLCAiaXBfc3ViamVjdCI6ICI3Ni4yNTEuMTY3LjIwNSIsICJpcF9jb25maXJtZXIiOiAiNzYuMjUxLjE2Ny4yMDUiIH0.J7imU0NagVtwJ0HgbwwlzpVE0TaotcKFIK4pbyj3voR_PWOIfP_3b4yv0d7Kcexv7vnghxEFf47cTER7HbzoBg&input_json=%7B%22ids%22%3A%5B%7B%22appid%22%3A%22427520%22%7D%5D%2C%22context%22%3A%7B%22language%22%3A%22en%22%2C%22country_code%22%3A%22us%22%7D%2C%22data_request%22%3A%7B%22include_screenshots%22%3Atrue%2C%22include_tag_count%22%3A%2232%22%2C%22include_basic_info%22%3Atrue%7D%7D

const getStoreItemsURL = "https://api.steampowered.com/IStoreBrowseService/GetItems/v1/"
const popularTagsURL = "https://api.steampowered.com/IStoreService/GetMostPopularTags/v1/";

// 0. (re)learn how to define functions
// 1. perform a GET request, using fetch()
// 2. need to attach query params to the URL
// 3. probably will need to URL encode them

function getPopularTags() {
  const params = new URLSearchParams({access_token: process.env.STEAM_STORE_ACCESS_TOKEN})
  const finalURL = popularTagsURL + `?${params.toString()}`
  console.log("finalURL", finalURL);
  fetch(finalURL)
  .then(response => {
    return response.json(); 
  } 
  )
  .then(data => {
    console.log(JSON.stringify(data, null, 0));
  })
  .catch(error => {
    console.error('There was an error completing the fetch', error);
  });
}



async function getStoreItemDataForAppId(appId: number) {
  // setup data
  const input_json = {
    "ids": [
      {"appid": appId.toString()}
    ], 
    "context": {
      "language": "en",
      "country_code": "us"
    },
    "data_request": {
      "include_assets": true, 
      "include_release": true, 
      // "include_platforms":true,
      // "include_all_purchase_options":true,
      // "include_screenshots":true,
      // "include_trailers":true,
      "include_ratings":true,
      "include_reviews":true,
      "include_basic_info":true,
      // "include_supported_languages":true,
      //"include_full_description":true,
      // "include_included_items":true,
      "include_assets_without_overrides":true,
      // "apply_user_filters":true,
      "include_links":true,
      "include_tag_count": 32
    }
  }

  // perform request
  try {
    const params = new URLSearchParams({
      access_token: process.env.STEAM_STORE_ACCESS_TOKEN, input_json: JSON.stringify(input_json, null, 0)
    })
    const finalURL = getStoreItemsURL + `?${params.toString()}`
    // console.log(finalURL);
    const response = await fetch(finalURL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json(); // Parse the JSON data from the response
    // console.log(JSON.stringify(data, null, 0)); // Handle the JSON data

    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  } 
}

// getStoreItemDataForAppId(1);

let appIds: number[] = [];
let gamesWithoutAppIds = []; // ["VALORANT", "Super Monkey Ball"]
// appIds = [4544, 5775654, 5345, 6544]

interface Player {
  ratings: {
    [key: string]: {
      "name": string,
      "appId": string,
      "blurb"?: string
    }
  }
}

interface DataStructure {
  players: { [key: string]: Player };
}
// const structuredData = data as unknown as DataStructure;

function getAppIdsFromRatingsFile() {
  // for every player
  // for every rating level that the player has
  // for every game in the rating level
  // add the app id to the array

  for(const player of data.players){ // for each player in players array
    // const player = data.players[playerKey];

    console.log("Loading " + player.name + "'s games...");
    for(const ratingTierKey in player.ratings) { // for each rating key in player's ratings
      const ratingTier = player.ratings[ratingTierKey];

      for(const game of ratingTier){ // for each game within the ratingTier array
        if(game.appId === 0){
          gamesWithoutAppIds.push(game.name);
        }
        else{
          // console.log('AppID:' + game.appId); 
          appIds.push(game.appId);
        }
      }
      
    }
  }


  // TODO remove duplicate entries in both appIds and gamesWithoutAppIds
  console.log(appIds);
  console.log(gamesWithoutAppIds);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// using the previous appIds array, get store info for each appId
async function getStoreInfoForAllAppIds () {
  // for appId in appIds
  // get store data for that app id
  
  for(const appid of appIds){
    const response = await getStoreItemDataForAppId(appid);
    // console.log(JSON.stringify(response, null, 2));

    // write store data to database
    await writeGameInfoToDatabase(response.response.store_items[0])
    
    // wait a minute before getting the next game as to not hurt Mr. Steam
    console.log("Waiting for 5 seconds before continuing...");
    await sleep(5000);
    console.log("");
  }
}

const s3 = getS3Client();

// Function to download and upload an image
async function downloadAndUploadImage(imageUrl: string, s3Key: string) {
  try {
    // Step 1: Download the image using native fetch
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    // Convert response to buffer
    const imageBuffer = await response.arrayBuffer();

    // Step 2: Save the image to a temporary location
    const tempFilePath = path.join(__dirname, 'temp.jpg');
    fs.writeFileSync(tempFilePath, Buffer.from(imageBuffer));

    // Step 3: Upload the image to the S3 bucket
    const fileStream = fs.createReadStream(tempFilePath);
    const uploadParams = {
      Bucket: process.env.MC_AWS_S3_BUCKET,
      Key: s3Key, // The S3 key (path within the bucket)
      Region: process.env.MC_AWS_S3_REGION,
      Body: fileStream,
      ContentType: 'image/jpeg',
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    console.log(`Game artwork image uploaded successfully to ${process.env.MC_AWS_S3_BUCKET}/${s3Key}`);

    // Clean up: Delete the temporary file
    fs.unlinkSync(tempFilePath);

  } catch (error) {
    console.error('Error downloading or uploading the image:', error);
  }
}

function buildImageUrl(appId: number, path: string) {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/${path}`;
}

async function writeGameInfoToDatabase(gameInfoResponse: any) {
  // gameID
  const gameID = gameInfoResponse.appid;
  // game name
  const gameName = gameInfoResponse.name;

  console.log("Capturing and writing info for " + gameName + "...");

  const selectQuery = `
    SELECT "steamAppId" FROM "Game"
    WHERE "steamAppId" = $1
  `
  const selectParams = [gameID];
  const selectResponse = await db(selectQuery, selectParams);
  // console.log("selectResponse", selectResponse)
  if (!(selectResponse.length === 0)) {
    console.log(gameName + " is already in database!");
    return;
  }
  // console.log(selectResponse);
  
  
  // we should expect selectResponse.length to be 1 since there's a row with the username Stellaric in the Player table


  // TODO make sure we don't already have this game in the database
  // (hint: do a SELECT first by the game's name)
  
  
  // release date
  const releaseDateTimestamp = gameInfoResponse.release.steam_release_date;
  const releaseDate = new Date(releaseDateTimestamp * 1000).toISOString(); // 2024-08-23 00:22:00.797972
  // capsule image path
  const capsuleImagePath = gameInfoResponse.assets.header; // TODO grab this image and write it to S3 with the key below
  const artworkS3Key = "games/" + gameName + "-" + gameID + "-" + capsuleImagePath;
  if (!checkIfKeyExists(process.env.MC_AWS_S3_BUCKET, artworkS3Key)) {
    await downloadAndUploadImage(buildImageUrl(gameID, capsuleImagePath), artworkS3Key);
  }
  
  // "formatted_final_price"
  const finalPrice = gameInfoResponse.best_purchase_option.formatted_final_price;
  // developer / publisher
  const developerName = gameInfoResponse.basic_info.developers.name;
  const publisherName = gameInfoResponse.basic_info.publishers.name;
  // summary filtered -> review percentage
  const steamReviewPercentage = gameInfoResponse.reviews.summary_filtered.percent_positive;
  // tags
  const gameTags = gameInfoResponse.tags;
  // short description
  const gameDescription = gameInfoResponse.basic_info.short_description;
  // Store URL path
  const storeURL = gameInfoResponse.store_url_path;

  // metacriticReviewPercent: integer
  // steamReviewPercent: integer
  
  const query = `
    INSERT INTO "Game"
      (name, "steamAppId", "storeURL", "storeName", "descriptionShort", "releaseDate", "artworkS3Key", "steamReviewPercent")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `
  const params = [gameName, gameID, storeURL, 'Steam', gameDescription, releaseDate, artworkS3Key, steamReviewPercentage];
  const insertResult = await db(query, params);
  
  // we should expect insertResults.length == 0, if its not then something weird happened
  if(insertResult.length !== 0){
    console.log("ERROR");
  }
  else{
    console.log("Write for " + gameName + " successful!");
  }
    
}

getAppIdsFromRatingsFile()
appIds = appIds.slice(0, 3); // only take the first 3 games off the appIds list
getStoreInfoForAllAppIds ()



// const fart = new URLSearchParams({
//   "search": 'funny dog',
//   sort: 'asc',
//   number: 5
// })

// https://google.com/search?search=funny+dog&sort=asc&number=5
// const finalURL = "https://google.com/search?" + "key=" + access_token;

// Task 3: GetItems request
// &input_json={"ids":[{"appid":"427520"}],"context":{"language":"en","country_code":"us"},"data_request":{"include_screenshots":true,"include_tag_count":"32","include_basic_info":true}}


