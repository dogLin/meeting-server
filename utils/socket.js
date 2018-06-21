const Koa = require('koa')
const app = new Koa()

// support socket.io
const server = require('http').Server(app.callback());
const io = require('socket.io')(server);

// socket handle
io.on('connection', socket => {
    console.log('new connection');

    socket.on('message', (data, cb) => {
    });

    socket.on('disconnect', () => {
        // console.log('some one disconnect');
    });

    socket.on('devices', (data, cb) => {
        console.log(data);
    });
});

server.listen(process.env.SOCKET || 5001, () => {
  console.log(`socket started on port`, process.env.SOCKET);
});

module.exports = io;
