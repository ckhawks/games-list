import { input, select, search } from '@inquirer/prompts';
import { db } from './util/db/db'

import fs from 'fs/promises';
import path from 'path';
// import cheerio from 'cheerio';
const cheerio = require('cheerio');

import dataJson from './data/ratings.json';

let data = dataJson;

async function start() {
  console.log("Welcome to Data Wizard!");
  console.log("");
  console.log("Fetching players...");
  // select a player


  const players = data.players;

  const playerChoices: any[] = players.map((player) => {
    return {
      name: player.name,
      value: player.name,
      description: "Add game ratings to " + player.name
    }
  })

 
  const playerSelection: any = await select({ message: 'Select a player',
    choices: [
      ...playerChoices,
      {
        name: "Add new player",
        value: "__newPlayer",
        description: "Create a new player to go on the list"
      },
      {
        name: "Exit",
        value: "exit",
        description: "See you later!"
      }
    ]
   });
  console.log("Answer: " + playerSelection)

  if (playerSelection === "__newPlayer") {
    console.log("Functionality not supported yet.")
    return;
  }
  if (playerSelection === "exit") {
    return;
  }
  playerManagement(playerSelection);
}

async function playerManagement(playerUsername: string) {
  let player = data.players.find(player => player.name === playerUsername);

  // console.log(player);
  console.log("Now managing " + player.name);
  const choiceSelection: any = await select({ message: 'Wtf you wanna do?',
    choices: [
      {
        name: "Add rating to game",
        value: "addRating"
      },
      {
        name: "Exit",
        value: "exit",
        description: "See you later!"
      }
    ]
   });

   if (choiceSelection === "addRating") {
    addRating(player);
   }  // add new rating to a game
}

function makeSteamStoreFuzzySearchUrl(term: string): string {
  return `https://store.steampowered.com/search/suggest?term=${term}&f=games&cc=US&realm=1&l=english&v=24883928&excluded_content_descriptors%5B%5D=3&excluded_content_descriptors%5B%5D=4&use_store_query=1&use_search_spellcheck=1&search_creators_and_tags=1`
}

function parseSearchHtmlToJson(responseHtml): any[] {
  const $ = cheerio.load(responseHtml);

  const results = [];

  $('a.match').each((index, element) => {
      const appId = $(element).attr('data-ds-appid');
      const title = $(element).find('.match_name').text().trim();
      const imageUrl = $(element).find('.match_img img').attr('src');
      const price = $(element).find('.match_subtitle').text().trim();
      const url = $(element).attr('href');

      console.log(appId);

      results.push({
          appId,
          title,
          imageUrl,
          price,
          url
      });
  });

  return results;
}

async function addRating(player: any) {
  const answer = await search({
    message: 'Enter the name of the game',
    source: async (input, { signal }) => {
      if (!input) {
        return [];
      }
  
      const url = makeSteamStoreFuzzySearchUrl(encodeURIComponent(input))
      const response = await fetch(
        url,
        { signal },
      );

      if (!response || !response.body) {
        throw new Error("Invalid response object");
      }

      // const data = response.json();
      const responseHtml = await response.text();
      // console.log(responseHtml);
      const games = parseSearchHtmlToJson(responseHtml);
      console.log("games: ", games);
  
      return [...games.map((game) => ({
        name: game.title + " (" + game.appId + ")",
        value: game,
        // description: game.title,
      })), {
        name: "It's not here",
        value: "notpresent"
      }];
    },
  });

  if (answer === "notpresent") {
    console.log("We'll make a new game.")
    await makeNewGameThenAddRating(player);
  } else {
    await addGameRating(player, answer)
  }
}

async function makeNewGameThenAddRating(player) {
  const gameNameAnswer = await input({ message: 'Enter the full name of the game' });

  await addGameRating(player, {
    title: gameNameAnswer,
    appId: 0
  })
}

import { number } from '@inquirer/prompts';

async function addGameRating(player: any, gameData: any) {
  // console.log("gameData: ", gameData);

  const ratingAnswer = await select({
    message: 'What do you rate this game?',
    choices: [
      {name: '10', value: 10},
      {name: '9', value: 9},
      {name: '8', value: 8},
      {name: '7', value: 7},
      {name: '6', value: 6},
      {name: '5', value: 5},
      {name: '4', value: 4},
      {name: '3', value: 3},
      {name: '2', value: 2},
      {name: '1', value: 1}
    ]
  });

  // find player index to use in querying 'data' variable
  let playerIndex = data.players.findIndex(ply => ply.name === player.name);
  let playerRatings = data.players[playerIndex].ratings;

  if (!playerRatings[ratingAnswer]) {
    playerRatings[ratingAnswer] = []; // Initialize as an empty array if not present
  }

  playerRatings[ratingAnswer].push({
    name: gameData.title,
    appId: gameData.appId
  });
  
  // console.log(data.players[playerIndex].ratings);
  
  // if(!(data.players[playerIndex].ratings as any).has(ratingAnswer)) {
  //   (data.players[playerIndex].ratings as any).set(ratingAnswer, [{
  //     name: gameData.title,
  //     appId: gameData.appId
  //   }])
  // } else {
  //   (data.players[playerIndex].ratings as any).set(ratingAnswer, [...data.players[playerIndex].ratings[ratingAnswer], {
  //     name: gameData.title,
  //     appId: gameData.appId
  //   }])
  // }
  // console.log(data.players[playerIndex].ratings);
  
  await saveRatingsJson()
  console.log(`Added ${ratingAnswer} for ${gameData.title} for ${data.players[playerIndex].name}`);
  await playerManagement(data.players[playerIndex].name);
}

async function saveRatingsJson() {
  const filePath = path.resolve(__dirname, './data/ratings.json');
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Ratings saved successfully.');
  } catch (error) {
    console.error('Error saving ratings:', error);
  }
}

// Start the application
start();