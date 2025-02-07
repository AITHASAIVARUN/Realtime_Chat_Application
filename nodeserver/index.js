const io = require('socket.io')(3000, {
    cors: {
        origin: "*",  // Allow all origins
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
            console.log(`${users[socket.id]} disconnected`);
            socket.broadcast.emit('user-left', users[socket.id]);
            delete users[socket.id];
        }
    });
});
