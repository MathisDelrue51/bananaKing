const express = require('express');

const socketHandler = require('./app/socketHandler');

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


io.on("connection", (socket) => {
    
    socketHandler.connecting(socket, io);

    socketHandler.disconnecting(socket, io);

    socketHandler.newPlayer(socket, io);

    socketHandler.startNewGame(socket, io);

    socketHandler.betValidated(socket, io);

    socketHandler.cardPlayed(socket, io);

    socketHandler.winnerSelected(socket, io);
});