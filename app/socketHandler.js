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
            io.emit('updateOtherPlayers', playersInGame);

            //Remove the disconnected user from the scoreBoard
            delete scoreInfo[playerName];
            io.emit('updateScoreBoard', scoreInfo);

            //TODO if the game has started and the disconnection is a player, send an alert to everyone
        });
    },

    newPlayer: (socket, io) => {
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
            io.emit('updateOtherPlayers', playersInGame);
        });
    },

    startNewGame: (socket, io) => {
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
                //Hide the start button for everyone, display round and turn
                io.emit('hideStartButton');
                io.emit('prepareWinnerModal', gameInfos.players);
                io.emit('updateRound', gameInfos.round);
                io.emit('updateTurn', gameInfos.turn);

                cards = gameInfos.allcards.map((x)=>x);

                while (gameInfos.cardDealed < gameInfos.round) {
                    for (player in playersInGame) {

                        index = Math.floor(Math.random() * (cards.length));
                        newCard = cards[index];
                        playersInGame[player].cards.push(newCard);
                        cards.splice(index, 1);
                    }

                    gameInfos.cardDealed++;
                }
                io.emit('updateHands', playersInGame);
                io.emit('updateOtherPlayers', playersInGame);
                io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
                io.emit('showBetModal', gameInfos.round);
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
                io.emit('updateOtherPlayers', playersInGame);
                io.emit('updateScoreBoard', scoreInfo);
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

    winnerSelected: (socket, io) => {

        socket.on('winnerSelected', ({
            winner
        }) => {
            playersInGame[winner].folds++;

            gameInfos.cardsPlayed = 0;

            gameInfos.turn++;

            board = {};

            io.emit('updateOtherPlayers', playersInGame);

            io.emit('hideWinnerModal');

            io.emit('cleanBoard');

            if (gameInfos.turn > gameInfos.round) {
                console.log("fin du round")
                socketHandler.updateScore();
                io.emit('updateScoreBoard', scoreInfo);

                gameInfos.betsDone = 0;

                if (gameInfos.round == 10) {
                    console.log("fin de la partie");
                } else {
                    gameInfos.round++;
                    gameInfos.turn = 1;
                    io.emit('updateRound', gameInfos.round);
                    io.emit('updateTurn', gameInfos.turn);
                    //gameInfos.whoHasToPlay =

                    gameInfos.cardDealed = 0;
                    cards = gameInfos.allcards.map((x)=>x);

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

                    io.emit('updateHands', playersInGame);
                    io.emit('updateOtherPlayers', playersInGame);
                    io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
                    io.emit('showBetModal', gameInfos.round);
                }

            } else {
                io.emit('updateTurn', gameInfos.turn);

                gameInfos.whoHasToPlay = winner;

                io.emit('updateWhoHasToPlay', gameInfos.whoHasToPlay);
            }
        });
    },

    updateScore: (socket, io) => {
        console.log("calcul des points")

        for (player in playersInGame) {

            switch (gameInfos.round) {
                case 1:
                    scoreInfo[player].foldsRound1 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound1 == 0) {
                        if (scoreInfo[player].foldsRound1 == 0) {
                            scoreInfo[player].scoreRound1 = 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound1 = -10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound1 == scoreInfo[player].betRound1) {
                            scoreInfo[player].scoreRound1 = 20 * scoreInfo[player].betRound1;
                        } else {
                            scoreInfo[player].scoreRound1 = -10 * Math.abs(scoreInfo[player].betRound1 - scoreInfo[player].foldsRound1);
                        }
                    }
                    break;
                case 2:
                    scoreInfo[player].foldsRound2 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound2 == 0) {
                        if (scoreInfo[player].foldsRound2 == 0) {
                            scoreInfo[player].scoreRound2 = scoreInfo[player].scoreRound1 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound2 = scoreInfo[player].scoreRound1 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound2 == scoreInfo[player].betRound2) {
                            scoreInfo[player].scoreRound2 = scoreInfo[player].scoreRound1 + 20 * scoreInfo[player].betRound2;
                        } else {
                            scoreInfo[player].scoreRound2 = scoreInfo[player].scoreRound1 - 10 * Math.abs(scoreInfo[player].betRound2 - scoreInfo[player].foldsRound2);
                        }
                    }
                    break;
                case 3:
                    scoreInfo[player].foldsRound3 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound3 == 0) {
                        if (scoreInfo[player].foldsRound3 == 0) {
                            scoreInfo[player].scoreRound3 = scoreInfo[player].scoreRound2 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound3 = scoreInfo[player].scoreRound2 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound3 == scoreInfo[player].betRound3) {
                            scoreInfo[player].scoreRound3 = scoreInfo[player].scoreRound2 + 20 * scoreInfo[player].betRound3;
                        } else {
                            scoreInfo[player].scoreRound3 = scoreInfo[player].scoreRound2 - 10 * Math.abs(scoreInfo[player].betRound3 - scoreInfo[player].foldsRound3);
                        }
                    }
                    break;
                case 4:
                    scoreInfo[player].foldsRound4 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound4 == 0) {
                        if (scoreInfo[player].foldsRound4 == 0) {
                            scoreInfo[player].scoreRound4 = scoreInfo[player].scoreRound3 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound4 = scoreInfo[player].scoreRound3 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound4 == scoreInfo[player].betRound4) {
                            scoreInfo[player].scoreRound4 = scoreInfo[player].scoreRound3 + 20 * scoreInfo[player].betRound4;
                        } else {
                            scoreInfo[player].scoreRound4 = scoreInfo[player].scoreRound3 - 10 * Math.abs(scoreInfo[player].betRound4 - scoreInfo[player].foldsRound4);
                        }
                    }
                    break;
                case 5:
                    scoreInfo[player].foldsRound5 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound5 == 0) {
                        if (scoreInfo[player].foldsRound5 == 0) {
                            scoreInfo[player].scoreRound5 = scoreInfo[player].scoreRound4 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound5 = scoreInfo[player].scoreRound4 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound5 == scoreInfo[player].betRound5) {
                            scoreInfo[player].scoreRound5 = scoreInfo[player].scoreRound4 + 20 * scoreInfo[player].betRound5;
                        } else {
                            scoreInfo[player].scoreRound5 = scoreInfo[player].scoreRound4 - 10 * Math.abs(scoreInfo[player].betRound5 - scoreInfo[player].foldsRound5);
                        }
                    }
                    break;
                case 6:
                    scoreInfo[player].foldsRound6 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound6 == 0) {
                        if (scoreInfo[player].foldsRound6 == 0) {
                            scoreInfo[player].scoreRound6 = scoreInfo[player].scoreRound5 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound6 = scoreInfo[player].scoreRound5 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound6 == scoreInfo[player].betRound6) {
                            scoreInfo[player].scoreRound6 = scoreInfo[player].scoreRound5 + 20 * scoreInfo[player].betRound6;
                        } else {
                            scoreInfo[player].scoreRound6 = scoreInfo[player].scoreRound5 - 10 * Math.abs(scoreInfo[player].betRound6 - scoreInfo[player].foldsRound6);
                        }
                    }
                    break;
                case 7:
                    scoreInfo[player].foldsRound7 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound7 == 0) {
                        if (scoreInfo[player].foldsRound7 == 0) {
                            scoreInfo[player].scoreRound7 = scoreInfo[player].scoreRound6 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound7 = scoreInfo[player].scoreRound6 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound7 == scoreInfo[player].betRound7) {
                            scoreInfo[player].scoreRound7 = scoreInfo[player].scoreRound6 + 20 * scoreInfo[player].betRound7;
                        } else {
                            scoreInfo[player].scoreRound7 = scoreInfo[player].scoreRound6 - 10 * Math.abs(scoreInfo[player].betRound7 - scoreInfo[player].foldsRound7);
                        }
                    }
                    break;
                case 8:
                    scoreInfo[player].foldsRound8 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound8 == 0) {
                        if (scoreInfo[player].foldsRound8 == 0) {
                            scoreInfo[player].scoreRound8 = scoreInfo[player].scoreRound7 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound8 = scoreInfo[player].scoreRound7 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound8 == scoreInfo[player].betRound8) {
                            scoreInfo[player].scoreRound8 = scoreInfo[player].scoreRound7 + 20 * scoreInfo[player].betRound8;
                        } else {
                            scoreInfo[player].scoreRound8 = scoreInfo[player].scoreRound7 - 10 * Math.abs(scoreInfo[player].betRound8 - scoreInfo[player].foldsRound8);
                        }
                    }
                    break;
                case 9:
                    scoreInfo[player].foldsRound9 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound9 == 0) {
                        if (scoreInfo[player].foldsRound9 == 0) {
                            scoreInfo[player].scoreRound9 = scoreInfo[player].scoreRound8 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound9 = scoreInfo[player].scoreRound8 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound9 == scoreInfo[player].betRound9) {
                            scoreInfo[player].scoreRound9 = scoreInfo[player].scoreRound8 + 20 * scoreInfo[player].betRound9;
                        } else {
                            scoreInfo[player].scoreRound9 = scoreInfo[player].scoreRound8 - 10 * Math.abs(scoreInfo[player].betRound9 - scoreInfo[player].foldsRound9);
                        }
                    }
                    break;
                case 10:
                    scoreInfo[player].foldsRound10 = playersInGame[player].folds;
                    playersInGame[player].folds = 0;
                    if (scoreInfo[player].betRound10 == 0) {
                        if (scoreInfo[player].foldsRound10 == 0) {
                            scoreInfo[player].scoreRound10 = scoreInfo[player].scoreRound9 + 10 * gameInfos.round;
                        } else {
                            scoreInfo[player].scoreRound10 = scoreInfo[player].scoreRound9 - 10 * gameInfos.round;
                        }
                    } else {
                        if (scoreInfo[player].foldsRound10 == scoreInfo[player].betRound10) {
                            scoreInfo[player].scoreRound10 = scoreInfo[player].scoreRound9 + 20 * scoreInfo[player].betRound10;
                        } else {
                            scoreInfo[player].scoreRound10 = scoreInfo[player].scoreRound9 - 10 * Math.abs(scoreInfo[player].betRound10 - scoreInfo[player].foldsRound10);
                        }
                    }
                    break;
                default:
                    console.log("Pas de round correspondant");
            };
        }

    }
}

module.exports = socketHandler;