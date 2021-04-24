const socket = io();

//Update the number of connected players displayed (without name validated)
socket.on('updateNb', (nbPlayers) => {
    const playersInGame = document.getElementById('nbPlayers');
    playersInGame.textContent = `${nbPlayers}/6`
});

//Update list of players and score board with validated names
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

socket.on('updateOtherPlayers', (playersInGame) => {
    //Retrieve the current player's name
    const currentPlayer = document.getElementById('nameCurrentPlayer').textContent;

    const template = document.getElementById('template-otherPlayersInfos');

    const otherPlayers = document.getElementById('topBoard');
    otherPlayers.textContent = "";

    //For every player in game (except current player, we add and complete the otherPlayer template in the topboard)
    for (player in playersInGame) {
        if (player !== currentPlayer) {

            const newPlayer = document.importNode(template.content, true);
            newPlayer.querySelector('.playerName').textContent = player;
            newPlayer.querySelector('.previousPlayer').textContent = `Joueur précédent: ${playersInGame[player].previousPlayer}`;
            newPlayer.querySelector('.nextPlayer').textContent = `Joueur suivant: ${playersInGame[player].nextPlayer}`;
            newPlayer.querySelector('.orderInTurn').textContent = `Ordre: ${playersInGame[player].order}e`;
            newPlayer.querySelector('.cardLeftInHand').textContent = `Cartes restantes: ${playersInGame[player].cards.length}`;
            otherPlayers.appendChild(newPlayer);
        }
    }
});

//Hide the start button for every player already in the game
socket.on('hideStartButton', () => {
    const startButton = document.getElementById('startButton');
    startButton.classList.add('is-hidden');
});

//Update the round displayed
socket.on('updateRound', (round) => {
    document.getElementById('currentRound').textContent = `Round: ${round}`;
});

//Update the turn displayed
socket.on('updateTurn', (turn) => {
    document.getElementById('currentTurn').textContent = `Turn: ${turn}`;
});

//Update the name of the player who has to play
socket.on('updateWhoHasToPlay', (turn) => {
    document.getElementById('currentTurn').textContent = `Turn: ${turn}`;
});

//Update player hand with its cards
// warning: here all players cards are provided, so we verify who is the current player before calling showCards with the corresponding cards
socket.on('updateHands', (playersInGame) => {

    const currentPlayer = document.getElementById('nameCurrentPlayer').textContent;

    app.showCards(playersInGame[currentPlayer].cards);
});

//Update the board (cards played) for every players each time a player play a card
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

    hasPlayed: false,

    /**
     * Initiate the event listeners on the page
     */
    init: () => {
        console.log('init !');

        const pseudoForm = document.getElementById('pseudoForm');
        pseudoForm.addEventListener('submit', app.insertNewPlayer);

        const startButton = document.getElementById('startButton');
        startButton.addEventListener('click', app.startNewGame);

        const scoreButton = document.getElementById('scoreButton');
        scoreButton.addEventListener('click', app.showScore);

    },

    
    /**
     * When submit button clicked on insertNewPlayer form
     * Insert the player name in the bottom board and send it to the server to add it to the player list
     * @param {Event} event 
     */
    insertNewPlayer: (event) => {

        event.preventDefault();

        const name = event.target[0].value;

        const playerName = document.getElementById('nameCurrentPlayer');
        playerName.textContent = name;

        const pseudoForm = document.getElementById('pseudoForm');
        pseudoForm.classList.add('is-hidden');

        socket.emit('newPlayer', name);
    },

    /**
     * When start button triggered
     * Call the startNewGame function on the server side
     */
    startNewGame: () => {
        socket.emit('startNewGame');
    },

    /**
     * When score button triggered
     * Open or close the score modal of the current game
     */
    showScore: () => {
        const scoreModale = document.getElementById('scoreModale');
        if (scoreModale.classList.contains('is-hidden')) {
            scoreModale.classList.remove('is-hidden');
        } else {
            scoreModale.classList.add('is-hidden');
        }
    },

    /**
     * When updateHands call on server side
     * Show the player cards and add event listener to each of them
     * @param {Array} playerCards 
     */
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

    
    //TODO It should verify it's the player turn, and that the card is playable
    /**
     * When a player click on a card
     * If if didn't play already, add it to the board
     * @param {Event} event 
     */
    playCard: (event) => {

        if (app.hasPlayed === false) {
            const cardPlayed = event.target.textContent;
            const idCardPlayed = event.target.id;

            const playerName = document.getElementById('nameCurrentPlayer').textContent;

            socket.emit('cardPlayed', {
                cardPlayed,
                playerName
            });

            app.hasPlayed = true;

            document.getElementById(`${idCardPlayed}`).remove();
        } else {
            console.log("carte déjà jouée");
        }


    },

}

document.addEventListener('DOMContentLoaded', app.init);