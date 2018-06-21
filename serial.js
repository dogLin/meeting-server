var SerialPort = require("serialport");
/*serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});*/
var serialPort = new SerialPort("COM1", {
  baudRate: 9600
});
serialPort.on( "data", function( data ) {
  data = +data;
  console.log(data);
});
serialPort.write(new Buffer('810104010100FF', 'hex'), function(res){
 console.log('success');
})