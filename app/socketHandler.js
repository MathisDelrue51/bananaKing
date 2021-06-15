const allCards = require('../data/cards.json');

//Contain all basics game information
const gameInfos = {
    nbPlayers: 0,
    players: [],
    isStarted: false,
    round: 1,
    turn: 1,
    allcards: allCards,
    nbCards: 66,
    cardDealed: 0,
    betsDone: 0,
    whoHasToPlay: null,
    cardsPlayed: 0
};

//Will contain all players information
const playersInGame = {

};

//Will contain the cards played 
let board = {

};

//Will contain the information for the scoreBoard
const scoreInfo = {

};

//Randomly order players turn
function orderPlayers() {
    //We push all player names in an array
    const playerPool = [];
    for (player in playersInGame) {
        playerPool.push(player);
    }

    //Randomization of the order in the array
    const orderedPlayerPool = [];
    while (playerPool.length != 0) {
        index = Math.floor(Math.random() * (playerPool.length));
        orderedPlayerPool.push(playerPool[index]);
        playerPool.splice(index, 1);
    }

    //Initiate the position of each player and define its previous and next player            
    for (player of orderedPlayerPool) {
        playersInGame[player].order = orderedPlayerPool.indexOf(player) + 1;

        if (orderedPlayerPool.indexOf(player) == 0) {
            playersInGame[player].previousPlayer = orderedPlayerPool[orderedPlayerPool.length - 1];
            gameInfos.whoHasToPlay = player;
        } else {
            playersInGame[player].previousPlayer = orderedPlayerPool[orderedPlayerPool.indexOf(player) - 1];
        }

        if (orderedPlayerPool.indexOf(player) == orderedPlayerPool.length - 1) {
            playersInGame[player].nextPlayer = orderedPlayerPool[0];
        } else {
            playersInGame[player].nextPlayer = orderedPlayerPool[orderedPlayerPool.indexOf(player) + 1];
        }
    }
};

//Reset all information to restart the game
function resetGameInfos() {
    gameInfos.round = 1;
    gameInfos.turn = 1;
    gameInfos.betsDone = 0;
    gameInfos.cardsPlayed = 0;
    board = {};
    //Reset scoreBoard and playersinfos
    for (player in playersInGame) {

        playersInGame[player] = {
            cards: [],
            order: null,
            previousPlayer: null,
            nextPlayer: null,
            bet: null,
            folds: 0
        };

        scoreInfo[player] = {
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
    }
};

//Reset necessary information to start new round
function updateInfosForNewRound() {
    gameInfos.betsDone = 0;
    gameInfos.round++;
    gameInfos.turn = 1;

    //gameInfos.whoHasToPlay =
    drawCards();

};

function drawCards() {
    gameInfos.cardDealed = 0;
    cards = gameInfos.allcards.map((x) => x);

    for (player in playersInGame) {
        playersInGame[player].cards = [];
    }

    while (gameInfos.cardDealed < gameInfos.round) {
        for (player in playersInGame) {

            index = Math.floor(Math.random() * (cards.length));
            newCard = cards[index];
            playersInGame[player].cards.push(newCard);
            cards.splice(index, 1);
        }

        gameInfos.cardDealed++;
    }
};

//Reset necessary information to start new round
function updateInfosForNewTurn(winnerFold) {

    gameInfos.cardsPlayed = 0;

    gameInfos.turn++;

    board = {};

    gameInfos.whoHasToPlay = winnerFold;
};

//update folds for the round and current score
function updateScore() {
    for (player in playersInGame) {

        switch (gameInfos.round) {
            case 1:
                scoreInfo[player].foldsRound1 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound1 = calculationScore(scoreInfo[player].betRound1, scoreInfo[player].foldsRound1, 0)
                break;
            case 2:
                scoreInfo[player].foldsRound2 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound2 = calculationScore(scoreInfo[player].betRound2, scoreInfo[player].foldsRound2, scoreInfo[player].scoreRound1)
                break;
            case 3:
                scoreInfo[player].foldsRound3 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound3 = calculationScore(scoreInfo[player].betRound3, scoreInfo[player].foldsRound3, scoreInfo[player].scoreRound2)
                break;
            case 4:
                scoreInfo[player].foldsRound4 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound4 = calculationScore(scoreInfo[player].betRound4, scoreInfo[player].foldsRound4, scoreInfo[player].scoreRound3)
                break;
            case 5:
                scoreInfo[player].foldsRound5 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound5 = calculationScore(scoreInfo[player].betRound5, scoreInfo[player].foldsRound5, scoreInfo[player].scoreRound4)
                break;
            case 6:
                scoreInfo[player].foldsRound6 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound6 = calculationScore(scoreInfo[player].betRound6, scoreInfo[player].foldsRound6, scoreInfo[player].scoreRound5)
                break;
            case 7:
                scoreInfo[player].foldsRound7 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound7 = calculationScore(scoreInfo[player].betRound7, scoreInfo[player].foldsRound7, scoreInfo[player].scoreRound6)
                break;
            case 8:
                scoreInfo[player].foldsRound8 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound8 = calculationScore(scoreInfo[player].betRound8, scoreInfo[player].foldsRound8, scoreInfo[player].scoreRound7)
                break;
            case 9:
                scoreInfo[player].foldsRound9 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound9 = calculationScore(scoreInfo[player].betRound9, scoreInfo[player].foldsRound9, scoreInfo[player].scoreRound8)
                break;
            case 10:
                scoreInfo[player].foldsRound10 = playersInGame[player].folds;
                playersInGame[player].folds = 0;

                scoreInfo[player].scoreRound10 = calculationScore(scoreInfo[player].betRound10, scoreInfo[player].foldsRound10, scoreInfo[player].scoreRound9)
                break;
            default:
                console.log("Pas de round correspondant");
        };
    }
};

//Return the score of the player after the round
function calculationScore(betRound, foldsRound, currentScore) {
    if (betRound == 0) {
        if (foldsRound == 0) {
            newScore = currentScore + 10 * gameInfos.round;
        } else {
            newScore = currentScore - 10 * gameInfos.round;
        }
    } else {
        if (foldsRound == betRound) {
            newScore = currentScore + 20 * betRound;
        } else {
            newScore = currentScore - 10 * Math.abs(foldsRound - betRound);
        }
    }
    return newScore;
};

const socketHandler = {

    connecting: (socket, io) => {
        console.log("user connected");
        //When a user connect to the page, udpate the nombre of players in game and show players who already validated their name   
        gameInfos.nbPlayers++;
        io.emit("updateNb", gameInfos.nbPlayers);
        //Show list of players already in game with validated names
        io.emit('updateListPlayers', gameInfos.players);
    },

    disconnecting: (socket, io) => {
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
            io.emit('updatePlayersInformation', playersInGame);

            //Remove the disconnected user from the scoreBoard
            delete scoreInfo[playerName];
            io.emit('updateScoreBoard', scoreInfo);

            if(gameInfos.players.length<2){
                gameInfos.isStarted = false;
            }
        });
    },

    newPlayer: (socket, io) => {
        // A new player validated his name    
        socket.on('newPlayer', (playerName) => {

            if (gameInfos.isStarted) {
                console.log('Partie déjà en cours')
            } else {
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
                    folds: 0
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
                io.emit('updatePlayersInformation', playersInGame);
            }

        });
    },

    startNewGame: (socket, io) => {
        //A player clicked on the start button
        socket.on('startNewGame', () => {
            //We verify if a game has already started and has the minimum of players
            if (gameInfos.isStarted) {
                console.log('Partie déjà en cours')
            } else {
                if (gameInfos.players.length < 2 || gameInfos.players.length > 6) {
                    console.log("Pas le bon nombre de joueurs")
                } else {
                    console.log("lancement de la partie");
                    gameInfos.isStarted = true;

                    orderPlayers();
                    drawCards();

                    //Hide the start button for everyone, display round and turn
                    io.emit('hideStartButton');
                    io.emit('prepareWinnerModal', gameInfos.players);
                    io.emit('updateRound', gameInfos.round);
                    io.emit('updateTurn', gameInfos.turn);
                    io.emit('updateHands', playersInGame);
                    io.emit('updatePlayersInformation', playersInGame);
                    io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
                    io.emit('showBetModal', gameInfos.round);
                }
            }

        });
    },

    betValidated: (socket, io) => {
        /**
         * Stock the value of the player bet in scoreInfo for the corresponding round
         */
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

            if (gameInfos.betsDone == gameInfos.nbPlayers) {
                io.emit('updatePlayersInformation', playersInGame);
                io.emit('updateScoreBoard', scoreInfo);
                io.emit('startAndStopRound');
            }
        });
    },

    cardPlayed: (socket, io) => {
        /**
         * Add an element to the object board with the name of the player that contain the card played
         */
        socket.on('cardPlayed', ({
            cardPlayed,
            playerName
        }) => {
            board[playerName] = [];
            board[playerName].push(cardPlayed);
            io.emit('updateBoard', board);

            gameInfos.cardsPlayed++;

            //If everyone has played, we won't update whoHasToPlay
            if (gameInfos.cardsPlayed == gameInfos.players.length) {
                io.emit('showWinnerModal');
            } else {
                gameInfos.whoHasToPlay = playersInGame[playerName].nextPlayer;
                io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
            }
        });
    },

    //Called when a turn is over and a winner for fold has been selected
    winnerSelected: (socket, io) => {

        socket.on('winnerSelected', ({
            winner
        }) => {
            playersInGame[winner].folds++;

            updateInfosForNewTurn(winner);

            io.emit('startAndStopRound');
            io.emit('hideWinnerModal');
            io.emit('cleanBoard');

            if (gameInfos.turn > gameInfos.round) {
                console.log("fin du round")
                updateScore();
                io.emit('updateScoreBoard', scoreInfo);

                if (gameInfos.round == 10) {
                    console.log("fin de la partie");
                } else {
                    console.log("nouveau round");
                    updateInfosForNewRound()
                    io.emit('cleanHands');
                    io.emit('updateRound', gameInfos.round);
                    io.emit('updateTurn', gameInfos.turn);
                    io.emit('updateHands', playersInGame);
                    io.emit('updatePlayersInformation', playersInGame);
                    io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
                    io.emit('showBetModal', gameInfos.round);
                }

            } else {

                io.emit('updatePlayersInformation', playersInGame);
                io.emit('updateTurn', gameInfos.turn);
                io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
            }
        });
    },

    //Called when user want to restart a game
    resetGame: (socket, io) => {
        //A player clicked on the reset button
        socket.on('resetGame', () => {

            if (gameInfos.players.length < 2 || gameInfos.players.length > 6) {
                console.log("Pas le bon nombre de joueurs")
            } else {
                console.log("reset de la partie");

                resetGameInfos()
                orderPlayers();
                drawCards();

                io.emit('hideWinnerModal');
                io.emit('hideStartButton');
                io.emit('cleanBoard');
                io.emit('cleanHands');
                io.emit('updateScoreBoard', scoreInfo);
                io.emit('clearWinnerModal');
                io.emit('prepareWinnerModal', gameInfos.players);
                io.emit('updateRound', gameInfos.round);
                io.emit('updateTurn', gameInfos.turn);
                io.emit('updateHands', playersInGame);
                io.emit('updatePlayersInformation', playersInGame);
                io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
                io.emit('showBetModal', gameInfos.round);
            }
        });
    },
}

module.exports = socketHandler;