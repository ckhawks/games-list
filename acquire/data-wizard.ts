import { input, select, search } from '@inquirer/prompts';
import { db } from './util/db/db'
// import cheerio from 'cheerio';
const cheerio = require('cheerio');

let players = [];

async function start() {
  console.log("Welcome to Data Wizard!");
  console.log("");
  console.log("Fetching players...");
  // select a player
  const playersResponse = await db(`
      SELECT * FROM "Player" 
    `, []
  )

  players = playersResponse;

  const playerChoices: any[] = players.map((player) => {
    return {
      name: player.username,
      value: player.username,
      description: "Add game ratings to " + player.username
    }
  })

 
  const playerSelection: any = await select({ message: 'Select a player',
    choices: [...playerChoices,
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
  let player = players.find(player => player.username === playerUsername);

  console.log(player);
  console.log("Now managing " + player.username);
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
  }
}

// function mainMenu() {
//   inquirer.prompt([
//       {
//           type: 'list',
//           name: 'action',
//           message: 'Main Menu - Choose an option:',
//           choices: ['Home Mode', 'Search Players', 'Exit']
//       }
//   ]).then(answers => {
//       switch (answers.action) {
//           case 'Home Mode':
//               homeMode();
//               break;
//           case 'Search Players':
//               searchPlayers();
//               break;
//           case 'Exit':
//               console.log('Exiting...');
//               process.exit();
//       }
//   });
// }

// function homeMode() {
//   inquirer.prompt([
//       {
//           type: 'list',
//           name: 'homeAction',
//           message: `Home Mode - Current Player: ${selectedPlayer || 'None'} - Choose an option:`,
//           choices: ['Switch Player', 'Go Back']
//       }
//   ]).then(answers => {
//       if (answers.homeAction === 'Switch Player') {
//           selectPlayer();
//       } else {
//           mainMenu();
//       }
//   });
// }

// function searchPlayers() {
//   inquirer.prompt([
//       {
//           type: 'input',
//           name: 'searchTerm',
//           message: 'Search for a player:'
//       }
//   ]).then(answers => {
//       const results = players.filter(player => player.toLowerCase().includes(answers.searchTerm.toLowerCase()));
//       if (results.length > 0) {
//           confirmSearchResults(results);
//       } else {
//           console.log('No players found. Returning to Main Menu.');
//           mainMenu();
//       }
//   });
// }

// function confirmSearchResults(results) {
//   inquirer.prompt([
//       {
//           type: 'list',
//           name: 'selectedResult',
//           message: 'Select a player from the search results:',
//           choices: [...results, 'Cancel']
//       }
//   ]).then(answers => {
//       if (answers.selectedResult !== 'Cancel') {
//           selectedPlayer = answers.selectedResult;
//           console.log(`Selected Player: ${selectedPlayer}`);
//       }
//       mainMenu();
//   });
// }

// function selectPlayer() {
//   inquirer.prompt([
//       {
//           type: 'list',
//           name: 'player',
//           message: 'Select a player to switch to:',
//           choices: [...players, 'Cancel']
//       }
//   ]).then(answers => {
//       if (answers.player !== 'Cancel') {
//           selectedPlayer = answers.player;
//           console.log(`Switched to Player: ${selectedPlayer}`);
//       }
//       homeMode();
//   });
// }

// Start the application
start();