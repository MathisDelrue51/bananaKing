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
    betsDone: 0,
    whoHasToPlay: null
};

//Will contain all players information
const playersInGame = {

};

//Will contain the cards played 
const board = {

};

//Will contain the information for the scoreBoard
const scoreInfo = {

};


io.on("connection", (socket) => {

    console.log("user connected");
    //When a user connect to the page, udpate the nombre of players in game and show players who already validated their name   
    gameInfos.nbPlayers++;
    io.emit("updateNb", gameInfos.nbPlayers);
    //Show list of players already in game with validated names
    io.emit('updateListPlayers', gameInfos.players);

    //When a player leave the page, update the players in game
    socket.on('disconnect', () => {
        console.log('user disconnected');
        gameInfos.nbPlayers--;
        io.emit("updateNb", gameInfos.nbPlayers);

        playerName = socket.id;

        //Remove the disconnected user from the player list
        gameInfos.players.splice(gameInfos.players.indexOf(playerName), 1);
        io.emit('updateListPlayers', gameInfos.players);

        //Remove the disconnected user from the players in game
        delete playersInGame[playerName];
        io.emit('updateOtherPlayers', playersInGame);

        //Remove the disconnected user from the scoreBoard
        delete scoreInfo[playerName];
        io.emit('updateScoreBoard', scoreInfo);

        //TODO if the game has started and the disconnection is a player, send an alert to everyone
    });

    // A new player validated his name    
    socket.on('newPlayer', (playerName) => {

        socket.id = playerName;

        //Add the name to the list of players
        gameInfos.players.push(playerName);

        //Create an object to represent the player and all needed information
        playersInGame[playerName] = {
            cards: [],
            order: null,
            previousPlayer: null,
            nextPlayer: null,
            bet: null,
            folds: null
        };

        //Create an object to keep track of the score of the player 
        scoreInfo[playerName] = {
            betRound1: null,
            foldsRound1: null,
            scoreRound1: null,
            betRound2: null,
            foldsRound2: null,
            scoreRound2: null,
            betRound3: null,
            foldsRound3: null,
            scoreRound3: null,
            betRound4: null,
            foldsRound4: null,
            scoreRound4: null,
            betRound5: null,
            foldsRound5: null,
            scoreRound5: null,
            betRound6: null,
            foldsRound6: null,
            scoreRound6: null,
            betRound7: null,
            foldsRound7: null,
            scoreRound7: null,
            betRound8: null,
            foldsRound8: null,
            scoreRound8: null,
            betRound9: null,
            foldsRound9: null,
            scoreRound9: null,
            betRound10: null,
            foldsRound10: null,
            scoreRound10: null
        };

        //Update the list of players player names for everyone
        io.emit("updateListPlayers", gameInfos.players);

        //Update the scoreBoard
        io.emit('updateScoreBoard', scoreInfo);

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
                    gameInfos.whoHasToPlay = player;
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
            io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);

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
        //TODO Find the player who has the order 1 and send his name to update whoHasToPlay
        //io.emit('updateWhoHasToPlay', name);
        io.emit('showBetModal', gameInfos.round);

    };

    socket.on('betValidated', ({
        playerName,
        betValue
    }) => {
        playersInGame[playerName].bet = betValue;
        switch (gameInfos.round) {
            case 1:
                scoreInfo[playerName].betRound1 = betValue;
                break;
            case 2:
                scoreInfo[playerName].betRound2 = betValue;
                break;
            case 3:
                scoreInfo[playerName].betRound3 = betValue;
                break;
            case 4:
                scoreInfo[playerName].betRound4 = betValue;
                break;
            case 5:
                scoreInfo[playerName].betRound5 = betValue;
                break;
            case 6:
                scoreInfo[playerName].betRound6 = betValue;
                break;
            case 7:
                scoreInfo[playerName].betRound7 = betValue;
                break;
            case 8:
                scoreInfo[playerName].betRound8 = betValue;
                break;
            case 9:
                scoreInfo[playerName].betRound9 = betValue;
                break;
            case 10:
                scoreInfo[playerName].betRound10 = betValue;
                break;
            default:
                console.log("Pas de round correspondant");
        };
        gameInfos.betsDone++;

        if (gameInfos.betsDone === gameInfos.nbPlayers) {
            io.emit('updateScoreBoard', scoreInfo);
        }
    });

    //Add an element to the object board with the name of the player that contain the card played
    socket.on('cardPlayed', ({
        cardPlayed,
        playerName
    }) => {
        board[playerName] = [];
        board[playerName].push(cardPlayed);
        io.emit('updateBoard', board);

        //TODO If everyone has played, we won't update whoHasToPlay
        gameInfos.whoHasToPlay = playersInGame[playerName].nextPlayer;
        io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
    });
});