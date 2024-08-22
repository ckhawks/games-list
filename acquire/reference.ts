// console.log("Loaded data1: " + data); // -> [Object object], tries to concatenate
// console.log(data);
// console.log("Loaded data3: " + JSON.stringify(data, null, 2)); 
// console.log("Game: ", data['players'][0]['ratings']['10'][0]['game']); // How to traverse properties in the data
// console.log("Player 1's name: " , data.players[0]['name']);
/*
Task #1: print the following output

Players:
Stellaric
DeadNotSleeping

Things to explore:
- for loop
- getting dictionary/object values by keys
*/

// console.log("Account Names:");
// for(var i = 0; i < data.players.length; i++){
//   console.log(data.players[i]['name']);
// };

// data.players.forEach(item => {
//   console.log(item.name);
// });

// for (const item of data.players) {
//   console.log(item.name);
// }

// const names = data.players.map(item => item.name);
// console.log(names);  // Output: ["Item 1", "Item 2", "Item 3"]


// here's a dictionary
const jasonData = {
  "id": 1,
  "name": "Item 1",
  "price": 10.99
};

// function jasonData(price: number) {
//   return (price + 2);
// }

// console.log(jasonData); // -> prints the whole dictionary
// console.log(jasonData['price']); // -> 10.99
// console.log(jasonData.price);


// here's an array
const jsonArray = [
  "dave", // 0
  "josh", // 1
  "trenten" // 2
];
// console.log(jsonArray); // -> prints the whole array
// console.log(jsonArray[1]); // -> josh

// here's an array of dictionaries
const jsonArrayWithDicts = [
  { "id": 1, "name": "Item 1", "price": 10.99 },
  { "id": 2, "name": "Item 2", "price": 12.99 },
  { "id": 3, "name": "Item 3", "price": 8.99 }
];

// async function getPgVersion() {
//   const result = await db(`SELECT version()`, []);
//   console.log(result[0]);
// }
// how load json file into jaba scrib

// https://steamapi.xpaw.me/#IStoreService/GetMostPopularTags

// console.log("hey");
// getPgVersion();

/*

// Functional:
const params = new URLSearchParams({
  param1: 'value1',
  param2: 'value2'
});

async function getData() {
  fetch(`https://api.example.com/data?${params.toString()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      // how do i get the data out of this block scope
      return data;
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}
  
//  Imperative:
async function getData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json(); // Parse the JSON data from the response
    console.log(data); // Handle the JSON data

    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  } 
}

const data = getData();

// do more stuff

*/

// let word = 'concatenation';
// console.log(`Here's another way you can do string ${word}!`);