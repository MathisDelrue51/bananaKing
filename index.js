const express = require('express');

const allCards = require('./data/cards.json');

const {
    Server,
    Socket
} = require('socket.io');

const app = express();
const port = 3000;

app.use(express.static('public'));

const http = app.listen(port, () => {
    console.log(`Skull app listening at http://localhost:${port}`)
});

const io = new Server(http);

//Contain all basics game information
const gameInfos = {
    nbPlayers: 0,
    players: [],
    isStarted: false,
    round: 5,
    turn: 1,
    cards: allCards,
    nbCards: 66,
    cardDealed: 0,
};

//Will contain all players information
const playersInGame = {

};

//Will contain the cards played 
const board = {

};


io.on("connection", (socket) => {

    console.log("user connected");
    //When a user connect to the page, udpate the nombre of players in game and show players who already validated their name   
    gameInfos.nbPlayers++;
    io.emit("updateNb", gameInfos.nbPlayers);
    //Show list of players already in game and update score board with player names
    io.emit('updateListPlayers', gameInfos.players);

    //When a player leave the page, update the players in game
    //TODO should update the list of players name and the score board
    socket.on('disconnect', () => {
        console.log('user disconnected');
        gameInfos.nbPlayers--;
        io.emit("updateNb", gameInfos.nbPlayers);

        //TODO Find which player disconnected and update list of players  
    });

    // A new player validated his name    
    socket.on('newPlayer', (playerName) => {

        //Add the name to the list of players
        gameInfos.players.push(playerName);

        //Create an object to represent the player and all needed information
        playersInGame[playerName] = {
            cards: [],
            order: 0,
            previousPlayer: null,
            nextPlayer: null
        };

        //Update the list of players and score board with player names for everyone
        io.emit("updateListPlayers", gameInfos.players);

        //Update topboard to show other players on every one screen.
        io.emit('updateOtherPlayers', playersInGame);
    });

    //A player clicked on the start button
    socket.on('startNewGame', () => {
        //We verify if a game has already started and has the minimum of players
        // if (gameInfos.isStarted) {
        //     console.log('Partie déjà en cours')
        // } else 
        if (gameInfos.nbPlayers < 2 || gameInfos.nbPlayers > 6) {
            console.log("Pas le bon nombre de joueurs")
        } else {
            console.log("lancement de la partie");
            gameInfos.isStarted = true;

            //We push all player names in an array
            const playerPool = [];
            for (player in playersInGame) {
                playerPool.push(player);
            }

            //Randomization of the order in the array
            const orderedPlayerPool = [];
            while (playerPool.length !== 0) {
                index = Math.floor(Math.random() * (playerPool.length - 1));
                orderedPlayerPool.push(playerPool[index]);
                playerPool.splice(index, 1);
            }

            //Initiate the position of each player and define its previous and next player            
            for (player of orderedPlayerPool) {
                playersInGame[player].order = orderedPlayerPool.indexOf(player) + 1;

                if (orderedPlayerPool.indexOf(player) === 0) {
                    playersInGame[player].previousPlayer = orderedPlayerPool[orderedPlayerPool.length - 1];
                } else {
                    playersInGame[player].previousPlayer = orderedPlayerPool[orderedPlayerPool.indexOf(player) - 1];
                }

                if (orderedPlayerPool.indexOf(player) === orderedPlayerPool.length - 1) {
                    playersInGame[player].nextPlayer = orderedPlayerPool[0];
                } else {
                    playersInGame[player].nextPlayer = orderedPlayerPool[orderedPlayerPool.indexOf(player) + 1];
                }
            }
            //Hide the start button for everyone, display round and turn
            io.emit('hideStartButton');
            io.emit('updateRound', gameInfos.round);
            io.emit('updateTurn', gameInfos.turn);            

            //Call drawCards function on server to draw cards to every player            
            drawCards();
        }
    });
    
    /**
     * Draw a cards to each players depending on the current round
     */
    function drawCards() {        

        while (gameInfos.cardDealed < gameInfos.round) {
            for (player in playersInGame) {

                index = Math.floor(Math.random() * (gameInfos.cards.length - 1));
                newCard = gameInfos.cards[index];                
                playersInGame[player].cards.push(newCard);
                gameInfos.cards.splice(index, 1);
            }

            gameInfos.cardDealed++;
        }
        io.emit('updateHands', playersInGame);
        io.emit('updateOtherPlayers', playersInGame);

    };

    //Add an element to the object board with the name of the player that contain the card played
    socket.on('cardPlayed', ({
        cardPlayed,
        playerName
    }) => {
        board[playerName] = [];
        board[playerName].push(cardPlayed);
        io.emit('updateBoard', board);
    });


});