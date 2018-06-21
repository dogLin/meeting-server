const Device = require('../model/device');
var SerialPort = require("serialport");
var serialPort = new SerialPort("COM1", {
  baudRate: 9600
});

function sendData(data){
    return new Promise(function(resolve, reject){
        let buffer = new Buffer(data, 'hex')
        console.log(buffer)
        
        serialPort.write(buffer, function(res){
            console.log("移动")
            resolve('success')
        })
        serialPort.on("eror", function(data) {
            reject('fail')
        });
    })
    
}

module.exports = sendData