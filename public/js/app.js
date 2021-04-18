const socket = io();

//Met à jour l'affichage du nombre de joueurs connecté (ils n'ont pas forcément validé leur nom)
socket.on('updateNb', (nbPlayers) => {
    const playersInGame = document.getElementById('nbPlayers');
    playersInGame.textContent = `${nbPlayers}/6`
});

//Met à jour la liste des joueurs ayant validé leur nom ainsi que le tableau des scores
socket.on('updateListPlayers', (players) => {

    const listPlayers = document.getElementById('playersList');
    listPlayers.textContent = "";
    const scoreBoard = document.getElementById('scoreModale')
    const activePlayers = scoreBoard.querySelector('.players');
    activePlayers.textContent = "";
    activePlayers.appendChild(document.createElement('th'));

    for (playerName of players) {

        const newPlayerInList = document.createElement('p');
        newPlayerInList.textContent = playerName;
        listPlayers.appendChild(newPlayerInList);

        const newPlayerInScoreBoard = document.createElement('th');
        newPlayerInScoreBoard.setAttribute('colspan', '2');
        newPlayerInScoreBoard.textContent = playerName;
        activePlayers.appendChild(newPlayerInScoreBoard);
    }
});

//Cahce le bouton start pour tous les joueurs présent actuellement sur le jeu
socket.on('hideStartButton', () => {
    const startButton = document.getElementById('startButton');
    startButton.classList.add('is-hidden');
    
    //drawCards est appelé par chaque navigateur, une sécurité a été rajouté côté serveur pour éviter de distribuer trop de cartes.
    socket.emit('drawCards');
});

//TODO Devrait mettre à jour une information pour que le joueur sache en quelle position il va jouer.
socket.on('updateOrder', ()=>{

});

//Met à jour l'affichage du round actuel pour tous les joueurs
socket.on('updateRound', (round)=>{
    document.getElementById('round').textContent = round;
});

//Met à jour la main de chaque joueur avec les cartes qui lui sont attribuées.
//Attention ici toutes les cartes sont récupérées et on vérifie quel est le joueur courant avant d(appeler la fonction qui lui affichera uniquement ses cartes
socket.on('updateHands', (playersInGame) => {

    const currentPlayer = document.getElementById('nameCurrentPlayer').textContent;

    app.showCards(playersInGame[currentPlayer].cards);
});

//Met à jour le board (les cartes jouées) pour tous les joueurs, à chaque fois qu'un joueur joue une carte.
socket.on('updateBoard', (board) => {

    const dropzone = document.getElementById('dropZone');
    dropzone.textContent = "";
    const template = document.getElementById('template-cardBoard');

    for (element in board) {
        const newCard = document.importNode(template.content, true);
        newCard.querySelector('.playerName').textContent = element;
        newCard.querySelector('.cardImage').textContent = board[element];
        dropzone.appendChild(newCard);
    }

});


const app = {

    havePlayed: false,

    init: () => {
        console.log('init !');

        const pseudoForm = document.getElementById('pseudoForm');
        pseudoForm.addEventListener('submit', app.insertNewPlayer);

        const startButton = document.getElementById('startButton');
        startButton.addEventListener('click', app.startNewGame);

        const scoreButton = document.getElementById('scoreButton');
        scoreButton.addEventListener('click', app.showScore);

    },

    //Permet au joueur de valider un formulaire avec son pseudo et de le renvoyer au serveur pour l'ajouter a la liste des joueurs.
    insertNewPlayer: (event) => {

        event.preventDefault();

        const name = event.target[0].value;

        const playerName = document.getElementById('nameCurrentPlayer');
        playerName.textContent = name;

        const pseudoForm = document.getElementById('pseudoForm');
        pseudoForm.classList.add('is-hidden');

        socket.emit('newPlayer', name);
    },

    //Lance la game si un joueur a cliqué sut le bouton "start Game"
    startNewGame: () => {
        socket.emit('startNewGame');
    },

    //Permet d'ouvrir ou de fermer la modale pour afficher les scores de la partie en cours
    showScore: () => {
        const scoreModale = document.getElementById('scoreModale');
        if (scoreModale.classList.contains('is-hidden')) {
            scoreModale.classList.remove('is-hidden');
        } else {
            scoreModale.classList.add('is-hidden');
        }
    },

    //Affiche les cartes dans la main du joueur et les rend cliquable 
    showCards: (playerCards) => {
        let index = 1;
        const boardPlayer = document.getElementById('boardCurrentPlayer');
        for (card of playerCards) {
            const newCard = document.createElement('div');
            const content = `${card.type} ${card.value}`;
            newCard.textContent = content;
            newCard.setAttribute('class', 'cardCurrentPlayer');
            newCard.setAttribute('id', `card${index}`);
            newCard.addEventListener('click', app.playCard);
            boardPlayer.appendChild(newCard);

            index++;
        }
    },

    //Lorsqu'un joueur clique sur une carte, si il n'a pas déjà joué, l'ajoute sur le board
    //TODO Attention, il va falloir faire appel à plus de vérification ici pour vérifier que la carte est jouable et que c'est bien le tour du joueur.
    playCard: (event) => {

        if (app.havePlayed === false) {
            const cardPlayed = event.target.textContent;
            const idCardPlayed = event.target.id;

            const playerName = document.getElementById('nameCurrentPlayer').textContent;

            socket.emit('cardPlayed', {
                cardPlayed,
                playerName
            });

            app.havePlayed = true;

            document.getElementById(`${idCardPlayed}`).remove();
        }else{
            console.log("carte déjà jouée");
        }


    },

}

document.addEventListener('DOMContentLoaded', app.init);