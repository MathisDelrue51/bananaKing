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

//Contient toutes les infos de base du jeu
const gameInfos = {
    round: 5,
    nbPlayers: 0,
    players: [],
    isStarted: false,
    allCardsCopy: allCards,
    cards: allCards,
    nbCards: 66,
    cardDealed: 0,
    initialPlayer: null
};

//Contient les joueurs en jeu et les cartes qu'ils ont en main
const playersInGame = {

};

//Contient le board avec les cartes jouées
const board = {

};


io.on("connection", (socket) => {

    console.log("user connected");
    //Lorsqu'un joueur se connecte, met a jour le nombre de joueur et affiche les joueurs en jeu
    gameInfos.nbPlayers++;
    io.emit("updateNb", gameInfos.nbPlayers);
    io.emit('updateListPlayers', gameInfos.players);

    //Lorsqu'un joueur se décconnecte, met a jour le nombre de joueur 
    //TODO et la liste les joueurs en jeu
    socket.on('disconnect', () => {
        console.log('user disconnected');
        gameInfos.nbPlayers--;
        io.emit("updateNb", gameInfos.nbPlayers);
        //TODO Trouver comment retirer le joueur qui s'est déconnecté de la liste des joueurs
        //Mettre a jour la liste des joueurs
    });


    // Un nouveau joueur a validé son pseudo
    socket.on('newPlayer', (playerName) => {

        //Ajoute le nom du joueur à la liste des joueurs
        gameInfos.players.push(playerName);

        //Crée un objet pour représenter le joueur
        playersInGame[playerName] = {
            cards : [],
            order: 0,
            previousPlayer: null,
            nextPlayer: null
        };

        //Met a joueur la liste des joueurs pour tout le monde
        io.emit("updateListPlayers", gameInfos.players);

        io.emit('updateOtherPlayers', playersInGame);
    });

    //Un joueur a cliqué sur le bouton start
    socket.on('startNewGame', () => {
        //On vérifie qu'une game n'est pas déjà en cours
        // if (gameInfos.isStarted) {
        //     console.log('Partie déjà en cours')
        // } else 
        if (gameInfos.nbPlayers < 2 || gameInfos.nbPlayers > 6) {
            console.log("Pas le bon nombre de joueurs")
        } else {
            console.log("lancement de la partie");
            gameInfos.isStarted = true;
            
            //Récupère de le nom de tous les joueurs inGame
            const playerPool = [];
            for(player in playersInGame){
                playerPool.push(player);
            }

            //Ordonne les joueurs aléatoirement
            const orderedPlayerPool = [];
            while(playerPool.length !== 0){
                index = Math.floor(Math.random() * (playerPool.length - 1));
                orderedPlayerPool.push(playerPool[index]);
                playerPool.splice(index, 1);
            }            

            //Initialise l'ordre de jeu pour le premier tour et défini le joueur suivant et le précédant
            for(player of orderedPlayerPool){
                playersInGame[player].order = orderedPlayerPool.indexOf(player) + 1;
                if(orderedPlayerPool.indexOf(player) === 0){
                    playersInGame[player].previousPlayer = orderedPlayerPool[orderedPlayerPool.length - 1];

                    gameInfos.initialPlayer = player ;
                }else{
                    playersInGame[player].previousPlayer = orderedPlayerPool[orderedPlayerPool.indexOf(player) - 1];
                }

                if(orderedPlayerPool.indexOf(player) === orderedPlayerPool.length - 1){
                    playersInGame[player].nextPlayer = orderedPlayerPool[0];
                }else{
                    playersInGame[player].nextPlayer = orderedPlayerPool[orderedPlayerPool.indexOf(player) + 1];
                }               
            }
            //On cache le bouton start pour tous et on affiche le round
            io.emit('hideStartButton');
            io.emit('updateRound', gameInfos.round);
            //TODO 
            //io.emit('updateOrder', playersInGame);
        }
    });

    //TODO Appelé au début de chaque tour pour définir l'ordre des joueurs en fonction de la personne qui débute
    socket.on('orderPlayers',() =>{

    });


    socket.on('drawCards', () => {
        //Comme drawCards est appelé par chaque client, on vérifie que le nombre de carte déjà distribuées par joueur est égale au round
        if (gameInfos.cardDealed < gameInfos.round) {
            while (gameInfos.cardDealed < gameInfos.round) {
                for (player in playersInGame) {                    
                    
                    newCard = gameInfos.cards[Math.floor(Math.random() * (gameInfos.nbCards - 1))];
                    //TODO Retirer la carte de la collection pour éviter les doublons lors du tirage
                    playersInGame[player].cards.push(newCard);                    
                }

                gameInfos.cardDealed++;                
            }
            io.emit('updateHands', playersInGame);
            io.emit('updateOtherPlayers', playersInGame);
        }
    });

    //Ajout un élement à notre objet board avec le nom du joueur qui contient la carte jouée.
    socket.on('cardPlayed', ({
        cardPlayed,
        playerName
    }) => {

        //TODO Changer en objet lorsqu'il faudra renvoyer plusieurs informations
        board[playerName] = [];
        board[playerName].push(cardPlayed);
        io.emit('updateBoard', board);
    });


});