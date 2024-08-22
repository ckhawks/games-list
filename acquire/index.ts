require("dotenv").config();
import { db } from "./util/db/db";

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
  console.log(appIds);
  console.log(gamesWithoutAppIds);
}
getAppIdsFromRatingsFile()

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
appIds = appIds.slice(0, 3); // only take the first 3 games off the appIds list

async function getStoreInfoForAllAppIds () {
  // for appId in appIds
  // get store data for that app id
  
  for(const appid of appIds){
    const response = await getStoreItemDataForAppId(appid);
    console.log(JSON.stringify(response, null, 2));
    
    sleep(2000);
    // write store data to database
  }
}

getStoreInfoForAllAppIds ()

// release date
// capsule image path
// "formatted_final_price"
// game name
// developer / publisher
// summary filtered -> review percentage
// tags
// short description

// const fart = new URLSearchParams({
//   "search": 'funny dog',
//   sort: 'asc',
//   number: 5
// })

// https://google.com/search?search=funny+dog&sort=asc&number=5
// const finalURL = "https://google.com/search?" + "key=" + access_token;

// Task 3: GetItems request
// &input_json={"ids":[{"appid":"427520"}],"context":{"language":"en","country_code":"us"},"data_request":{"include_screenshots":true,"include_tag_count":"32","include_basic_info":true}}


