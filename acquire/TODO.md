## TODO
1. Define a format for games rating lists to be made in (ratings.json)
2. Load the game rating definition list into program
3. For each game in the list, fetch the data for it
- Maybe we can go through each player's games and put together a big array of the appIds to fetch
- How to perform HTTP GET request (fetch, probably)
- How to pass query arguments to the request body
4. Write game data and player rating data to database
- How to perform SQL query?
- How to write INSERT INTO statement?
- How to set up SQL tables?
- Maybe we do a pass just writing the games into the database first, then a pass writing/defining the PlayerGame relationships?
5. Writing game data also requires writing the GameTag relationships
6. Pull game artwork and upload to S3

## Stretch goals
1. Automatically pull hours played per player for their games from Steam profile