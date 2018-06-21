const os = require('os')
const networksObj = os.networkInterfaces();

function getIPv4() {
    for (let nw in networksObj) {
        let objArr = networksObj[nw];
        console.log(`\r\n${nw}：`);
        /*objArr.forEach((obj, idx, arr) => {
            console.log(`地址：${obj.address}`);
            console.log(`掩码：${obj.netmask}`);
            console.log(`物理地址：${obj.mac}`);
            console.log(`协议族：${obj.family}`);
            if(obj.family === 'IPv4' && obj.address !== '127.0.0.1' && !obj.internal){
                return obj;
            }
        });*/
        for (var i=0; i < objArr.length; i++){
            var obj = objArr[i]
            if(obj.family === 'IPv4' && obj.address !== '127.0.0.1' && !obj.internal){
                return obj;
            }
        }
    }
}

console.log('-------------',getIPv4())

module.exports = getIPv4();