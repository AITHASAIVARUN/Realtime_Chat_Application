const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {};

io.on('connection', (socket) => {
    console.log("A new user connected:", socket.id);

    socket.on('new-user-joined', (nameofperson) => {
        if (nameofperson && !users[socket.id]) {
            console.log("New user joined:", nameofperson);
            users[socket.id] = nameofperson;
            socket.broadcast.emit('user-joined', nameofperson);
        }
    });

    socket.on('send', (message) => {
        if (users[socket.id]) {
            socket.broadcast.emit('receive', { message: message, nameofperson: users[socket.id] });
        }
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            const nameofperson = users[socket.id];
            console.log(`${users[socket.id]} disconnected`);
            socket.broadcast.emit('user-left', nameofperson);
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
