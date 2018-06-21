const dgram = require('dgram');
const Protocol = require('../utils/protocol')
const defineConstants = require('./constantService')
const moment = require('moment')
const type = require('../utils/type')

const constants = defineConstants({
    protocol: {
        id: 'device_protocol_structure'
    },
    protocolFixedLength: {
        id: 'device_protocol_fixedlength'
    }
})

const client = dgram.createSocket('udp4');
client.bind(function () {
    client.setBroadcast(true);
});

class DeviceProtocolService extends Protocol {

    /**
     * Creates an instance of DeviceProtocolService.
     * @param {any} destDevice 目标地址码
     * @param {any} srcAddr 发送者地址码
     * @param {any} command 命令码
     * @param {any} priority 发送者级别
     * @param {any} data 数据
     * @memberof DeviceProtocolService
     */
    constructor(destDevice, srcAddr, command, priority, data) {
        let dataLength;
        if (type(data) == 'uint8array') {
            dataLength = data.length;
            super(constants.protocolFixedLength + dataLength);
        } else if (type(data) == 'number') {
            dataLength = data.toString(16).length / 2
            super(constants.protocolFixedLength + dataLength);
        } else {
            throw (`data type must not be ${type(data)}`)
        }
        this.protocolStructure = Object.assign({}, constants.protocol);
        this.protocolStructure.destDevice.value = destDevice;
        this.protocolStructure.srcAddr.value = srcAddr;
        this.protocolStructure.command.value = command;
        this.protocolStructure.priority.value = priority;
        this.protocolStructure.sendTime.value = moment().format("YYYYMMDDHHmmss") + 0 + moment().day();
        this.protocolStructure.dataLength.value = dataLength;
        this.protocolStructure.data.value = data;
        this.protocolStructure.data.length = dataLength;
        this.protocolStructure.end.offset = this.protocolStructure.data.offset + dataLength;

        super.structureProtocol(this.protocolStructure);
    }

    /**
     * 发送协议
     * 
     * @param {any} port 
     * @param {any} address 
     * @param {any} cb 
     * @memberof DeviceProtocolService
     */
    sendProtocol(port, address, cb) {
        if (!this.protocol) {
            throw ('protocol is undefined')
        } else {
            let a = Buffer.from('1111')
            console.log(this.protocol);
            client.send(this.protocol, port, address, function (err, bytes) {
                if (err) {
                    throw(err)
                } else {
                    cb(bytes);
                }
                //client.close();
            })
        }
    }
}

module.exports = DeviceProtocolService;