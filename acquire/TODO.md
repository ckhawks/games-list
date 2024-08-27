## TODO
1. DONE: Define a format for games rating lists to be made in (ratings.json)
2. DONE: Load the game rating definition list into program
3. For each game in the list, fetch the data for it
- DONE: Maybe we can go through each player's games and put together a big array of the appIds to fetch
- Need to sort and deduplicate appIds and nonSteamGames arrays
- DONE: How to perform HTTP GET request (fetch, probably)
- DONE: How to pass query arguments to the request body
4. Write game data and player rating data to database
- DONE: How to perform SQL query?
- DONE: How to write INSERT INTO statement?
- DONE: How to set up SQL tables?
- DONE: Maybe we do a pass just writing the games into the database first
- then a pass writing/defining the PlayerGame relationships?
5. Writing game data also requires writing the GameTag relationships
6. DONE: Pull game artwork and upload to S3

## Stretch goals
1. Automatically pull hours played per player for their games from Steam profile