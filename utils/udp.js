const dgram = require('dgram');

const server = dgram.createSocket('udp4')

function monitorUdp(port, cb) {
    server.on('error', (err) => {
        console.log(`服务器异常：\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        console.log(`服务器收到：${msg} 来自 ${rinfo.address}:${rinfo.port}`);
        cb(msg, rinfo);
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`服务器监听 ${address.address}:${address.port}`);
    });

    /*server.bind(port, function () {
        server.setBroadcast(true)
    })*/
}

function bindUdp(port) {
    server.bind(port, function () {
        server.setBroadcast(true)
    });
    server.on('error', (err) => {
        console.log(`服务器异常：\n${err.stack}`);
        server.close();
    });
}

module.exports = monitorUdp;