const defineConstants = require('./constantService');
const DeviceProtocol = require('./deviceProtocolService');
const MeetingService = require('./meetingService');
const sendSerialData = require('./serialService');
const socketIo = require('../utils/socket');
const dgram = require('dgram');
const Device = require('../model/device');
const constants = require('../utils/constants');
const moment = require('moment')
const port = require('../config').deviceHeartPort;
const Protocol = require('../utils/protocol')
const iconv = require('iconv-lite');

const cts_p = defineConstants({
    protocol: {
        id: 'device_protocol_structure'
    },
    powerModel: {
        id: "device_powerctrl_model"
    },
    speakUnitModel: {
        id: "device_speakUnit_model"
    },
    hostHeartStructure: {
        id: "host_heart_structure"
    },
    speakUnitHeartStructure: {
        id: "speakunit_heart_structure"
    },
    macStructure: {
        id: "device_mac_structure"
    },
    modelStructure: {
        id: "device_speakmodel_structure"
    },
    volumeStructure: {
        id: "device_volume_structure"
    },
    voteStructure: {
        id: "device_vote_structure"
    },
    deviceHeartCommand: {
        id: "device_heart_command"
    },
    serverHeartRequest: {
        id: "server_heart_command"
    },
    heartSign: {
        id: "device_heart_sign"
    },
    heartVote: {
        id: "device_heart_vote"
    },
    heartAskPort: {
        id: "device_heart_askport"
    },
    heartPermitSpeak: {
        id: 'device_heart_speak'
    },
    heartProhibitSpeak: {
        id: 'device_heart_quiet'
    },
    allDeviceDest: {
        id: "device_all_destaddr"
    },
    serverAddr: {
        id: "device_default_srcaddr"
    },
    hostDest: {
        id: "device_m3_destaddr"
    },
    speakUnitDest: {
        id: "device_speakUnit_destaddr"
    },
    downMemberCommand: {
        id: "device_m3_command_downmember"
    },
    downMemberStructure: {
        id: "device_downmember_structure"
    },
    delMemberCommand: {
        id: "device_m3_command_delmember"
    },
    delAllMemberCommand: {
        id: "device_m3_command_delallmember"
    },
    setRostrumCommand: {
        id: "device_m3_command_appointrostrum"
    },
    dismissRostrumCommand: {
        id: "device_m3_command_dismissrostrum"
    },
    prohibitSpeakCommand: {
        id: "device_speakUnit_command_prohibit"
    },
    permitSpeakCommand: {
        id: "device_speakUnit_command_permit"
    },
    prohibitAllSpeakCommand: {
        id: "device_speakUnit_command_allprohibit"
    },
    permitAllSpeakCommand: {
        id: "device_speakUnit_command_allpermit"
    },
    switchModelCommand: {
        id: "device_speakUnit_command_switchmodel"
    },
    openChannelCommand: {
        id: "device_m3_command_openchannel"
    },
    closeChannelCommand: {
        id: "device_m3_command_closechannel"
    },
    adjustVolumeCommand: {
        id: "device_speakUnit_command_volume"
    },
    adjustChannelVolumeCommand: {
        id: "device_m3_command_volume"
    },
    startVoteCommand: {
        id: "device_command_vote"
    },
    endVoteCommand: {
        id: "device_command_disvote"
    },
    startSignCommand: {
        id: "device_command_sign"
    },
    endSignCommand: {
        id: "device_command_unsign"
    },
    signCommand: {
        id: "device_command_usersign"
    },
    voteCommand: {
        id: "device_command_uservote"
    },
    burnDeviceStructure: {
        id: "device_burn_structure"
    },
    netDeviceStructure: {
        id: "device_net_structure"
    },
    burnDeviceCommand: {
        id: "device_command_burn"
    },
    serverHeartStructure: {
        id: "server_heart_structure"
    }
})

class DeviceService {

    constructor() {
        this.devices = [];
        this.voteHearts = [];
        this.timeOut;
    }

    /**
     * 检测设备
     * 
     * @param {any} user 
     * @memberof DeviceService
     */
    async checkDevices(user) {
        let company = user.company
        let deviceRes = await Device.find({
            company: company
        });
        let saveDevicesPromise = []
        this.devices.map(async dev => {
            if (!deviceRes.find(dbDev => dbDev.mac == dev.mac)) {
                dev.company = company
                if(dev.ip){
                    let ipFormat = [];
                    for(var i = 0; i < dev.ip.length; i=i+2){
                        ipFormat.push(parseInt(dev.ip.substr(i,2), 16))
                    }
                    dev.ip = ipFormat.join(".")
                }
                delete dev.status
                saveDevicesPromise.push(Device.create(dev));
            }
        })
        await Promise.all(saveDevicesPromise)
        await this.saveSpeakUnitToHost(company)
    }

    /**
     * 保存发言单元至主机
     * 
     * @param {any} company 
     * @returns 
     * @memberof DeviceService
     */
    async saveSpeakUnitToHost(company) {
        let speakUnitDoc = await Device.find({
            company: company,
            model: 'speakUnit'
        });
        let hostDoc = await Device.findOne({
            company: company,
            model: 'host'
        });
        if(hostDoc && speakUnitDoc.length>0){
            speakUnitDoc.map(async speakUnit => {
                if(!hostDoc.mic.find(mic=>mic.toString() == speakUnit._id.toString())){
                    hostDoc.mic.push(speakUnit._id)
                }
            })
            return hostDoc.save()
        }
    }

    /**
     * 查询设备
     * 
     * @memberof DeviceService
     */
    async queryDevices(user, options) {
        let deviceQuery = Device.find(),company = user.company
        if (options) {
            if(options.deviceId) {
                deviceQuery = deviceQuery.where('_id', options.deviceId)
            }
        }
        let deviceList = await deviceQuery.find({
            company: company
        }).populate('mic').populate('room').exec();
        deviceList.map(device => {
            let dev = this.devices.find(dev=> dev.mac==device.mac)
            if(dev && dev.count<10){
                device.status = 1
            }
            else{
               device.status = 0
            }
        })
        return deviceList
    }

    /**
     * 保存设备
     * 
     * @param {any} device 
     * @memberof DeviceService
     */
    saveDevices(device) {

    }

    /**
     * 烧写mac与机号
     * 
     * @param {any} priority 
     * @param {any} data 
     * @returns 
     * @memberof DeviceService
     */
    async burnDevice(priority, data){
        try {
            await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.burnDeviceCommand, priority, data, cts_p.burnDeviceStructure)
            return Device.findOneAndUpdate({mac: data.mac},{devno: data.devno})
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 修改设备网络配置：ip、netmask、gateway、dns
     * 
     * @param {any} priority 
     * @param {any} data 
     * @memberof DeviceService
     */
    async netDevice(priority, data) {
        try {
            await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.burnDeviceCommand, priority, data, cts_p.netDeviceStructure)
            return Device.findOneAndUpdate({mac: data.mac},{ip: data.ip, subNet: data.netmask, gateway: data.gateway, dns: data.dns})
        } catch (error) {
            throw(error)
        }
        
    }

    /**
     * 下发指定人员至发言单元
     * 
     * @param {any} member 
     * @memberof DeviceService
     */
    downMember(priority, data) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.downMemberCommand, priority, data, cts_p.downMemberStructure)
    }

    /**
     * 删除人员发言单元
     * 
     * @param {any} priority 
     * @param {any} data 
     * @memberof DeviceService
     */
    delMember(priority, data) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.delMemberCommand, priority, data, cts_p.macStructure)
    }

    /**
     * 删除发言单元所有人员
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    delAllMember(priority) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.delAllMemberCommand, priority, [])
    }

    /**
     * 指定主席台
     * 
     * @param {any} data 
     * @memberof DeviceService
     */
    async setRostrum(priority, data) {
        try {
            await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.setRostrumCommand, priority, data, cts_p.macStructure)
            await Device.findOneAndUpdate({isRostrum: true}, {isRostrum: false})
            return Device.findOneAndUpdate({mac: data.mac}, {isRostrum: true})
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 取消主席台
     * 
     * @param {any} data 
     * @memberof DeviceService
     */
    async dismissRostrum(priority, data) {
        await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.dismissRostrumCommand, priority, data, cts_p.macStructure)
        return Device.findOneAndUpdate({mac: data.mac}, {isRostrum: false})
    }

    /**
     * 指定发言单元禁言
     * 
     * @param {any} priority 
     * @param {any} data 
     * @memberof DeviceService
     */
    async prohibitSpeak(priority, data) {
        await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.prohibitSpeakCommand, priority, data, cts_p.macStructure)
        return Device.findOneAndUpdate({mac: data.mac}, {allowSpeak: false})
    }

    /**
     * 指定发言单元解除禁言
     * 
     * @param {any} priority 
     * @param {any} data 
     * @memberof DeviceService
     */
    async permitSpeak(priority, data) {
        await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.permitSpeakCommand, priority, data, cts_p.macStructure)
        return Device.findOneAndUpdate({mac: data.mac}, {allowSpeak: true})
    }

    /**
     * 主席台外设备禁言
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    async prohibitAllSpeak(priority) {
        await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.prohibitAllSpeakCommand, priority, [])
        return Device.updateMany({model: 'speakUnit'}, {allowSpeak: false})
    }

    /**
     * 切换发言模式
     * 
     * @param {any} priority 
     * @param {any} model 
     * @memberof DeviceService
     */
    async switchModel(priority, data) {
        await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.switchModelCommand, priority, data, cts_p.modelStructure)
        //暂时写死
        return Device.findOneAndUpdate({model: 'host'}, {speakModel: data.model})
    }

    /**
     * 主席台外设备解除禁言
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    async permitAllSpeak(priority) {
        await this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.permitAllSpeakCommand, priority, [])
        return Device.updateMany({model: 'speakUnit'}, {allowSpeak: true})
    }

    /**
     * 开启背景音乐通道
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    openChannel(priority) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.openChannelCommand, priority, [])
    }

    /**
     * 关闭背景音乐通道
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    closeChannel(priority) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.closeChannelCommand, priority, [])
    }

    /**
     * 调节发言单元音量
     * 
     * @param {any} priority 
     * @param {any} volume 
     * @memberof DeviceService
     */
    adjustVolume(priority, volume) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.adjustVolumeCommand, priority, volume, cts_p.volumeStructure)
    }

    /**
     * 调节背景音乐音量
     * 
     * @param {any} priority 
     * @param {any} volume 
     * @memberof DeviceService
     */
    adjustChannelVolume(priority, volume) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.adjustChannelVolumeCommand, priority, volume, cts_p.volumeStructure)
    }

    /**
     * 发起表决
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    startVote(priority) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.startVoteCommand, priority, [])
    }

    /**
     * 取消表决
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    endVote(priority) {
       return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.endVoteCommand, priority, [])
    }

    /**
     * 投票
     * 
     * @param {any} priority 
     * @param {any} data 
     * @memberof DeviceService
     */
    vote(priority, data){
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.endVoteCommand, priority, data, cts_p.voteStructure)
    }

    /**
     * 发起签到
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    startSign(priority) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.startSignCommand, priority, [])
    }

    /**
     * 取消签到
     * 
     * @param {any} priority 
     * @memberof DeviceService
     */
    endSign(priority) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.endSignCommand, priority, [])
    }

    /**
     * 签到
     * 
     * @param {any} priority 
     * @param {any} data 
     * @memberof DeviceService
     */
    sign(priority, data) {
        return this.sendDeviceProtocol(cts_p.hostDest, cts_p.serverAddr, cts_p.signCommand, priority, data, cts_p.macStructure)
    }

    delayStop(){
        if(this.timeOut){
            clearTimeout(this.timeOut)
        }
        this.timeOut=setTimeout(()=>{
            this.cameraStop()
        },12000)
    }

    /**
     * 摄像头左移
     * 
     * @memberof DeviceService
     */
    cameraLeft(){
        this.delayStop()
        
        return sendSerialData('810106010C010103FF')
    }

    /**
     * 摄像头右移
     * 
     * @memberof DeviceService
     */
    cameraRight(){
        this.delayStop()
        return sendSerialData('810106010C010203FF')
    }

    /**
     * 摄像头上移
     * 
     * @memberof DeviceService
     */
    cameraUp(){
        this.delayStop()
        return sendSerialData('81010601010C0301FF')
    }

    /**
     * 摄像头下移
     * 
     * @memberof DeviceService
     */
    cameraDown(){
        this.delayStop()
        return sendSerialData('81010601010C0302FF')
    }

    /**
     * 摄像头停止
     * 
     * @memberof DeviceService
     */
    cameraStop(){
        return sendSerialData('8101060101010303FF')
    }

    /**
     * 设置摄像头位置
     * 
     * @param {any} num 
     * @returns 
     * @memberof DeviceService
     */
    async setUpCameraLo(num, mac) {
        let buffer = Buffer.from([0x81, 0x01, 0x04, 0x3F, 0x01, 0x00, 0xFF])
        buffer.writeUInt8(num, 5)
        try{
            let serialRes = await sendSerialData(buffer)
            if(serialRes=='success'){
                if(mac){
                    await Device.findOneAndUpdate({mac: mac}, {camera: num})
                }
            }
            return serialRes
        }catch(error){
            throw(error)
        }
    }

    /**
     * 调用摄像头位置
     * 
     * @param {any} num 
     * @returns 
     * @memberof DeviceService
     */
    async getCameraLo(num, mac) {
        if(!num && !mac){
            throw(400, {message: "参数错误"})
        }
        if(mac){
            let device = await Device.findOne({mac: mac})
            num = device.camera
        }
        
        let buffer = Buffer.from([0x81, 0x01, 0x04, 0x3F, 0x02, 0x00, 0xFF])
        buffer.writeUInt8(num, 5)
        return await sendSerialData(buffer)
    }

    /**
     * 删除摄像头位置
     * 
     * @param {any} num 
     * @returns 
     * @memberof DeviceService
     */
    async delCameraLo(num, mac) {
        let buffer = Buffer.from([0x81, 0x01, 0x04, 0x3F, 0x00, 0x00, 0xFF])
        buffer.writeUInt8(num, 5)
        try{
            let serialRes = await sendSerialData(buffer)
            if(serialRes=='success'){
                if(mac){
                    await Device.findOneAndUpdate({mac: mac}, {camera: -1})
                }
            }
            return serialRes
        }catch(error){
            throw(error)
        }
    }

    /**
     * 获取设备心跳
     * 
     * @memberof DeviceService
     */
    deviceHearts() {
        const client = dgram.createSocket('udp4');
        client.bind(port, function () {
            client.setBroadcast(true);
        });
        client.on('error', (err) => {
            console.log(`服务器异常：\n${err.stack}`);
            //client.close();
        });
        let data = this.structureData(cts_p.serverHeartStructure)
        let serverHeartProtocol = new DeviceProtocol(cts_p.allDeviceDest, cts_p.serverAddr, cts_p.serverHeartRequest, constants.admin_priority, data)

        /*setInterval(function () {
            client.send(serverHeartProtocol.protocol, port, '255.255.255.255', function (err, msg) {
                if (err) throw (err);
                console.log(msg)

            })
            if(this.devices.length>0){
                this.devices.map(dev => {
                    dev.count++;
                    console.log(dev.mac, '11111', dev.count)
                    if (dev.count > 3) {
                        dev.status = 0;
                        this.broadcastDevices(dev);
                    }
                })
            }
        }.bind(this), 3000)*/

        client.on('message', async (msg, rinfo) => {
            //console.log(`服务器收到：${msg} 来自 ${rinfo.address}:${rinfo.port}`);
            await this.handleUdpMessage(msg, rinfo);
            
        });

        //UdpService(6003, this.handleUdpMessage);
    }

    /**
     *  处理upd数据
     * 
     * @param {any} msg 
     * @param {any} finfo 
     * @memberof DeviceService
     */
    async handleUdpMessage(msg, rinfo) {
        let deviceModel = msg.readInt16BE(cts_p.protocol.srcAddr.offset, cts_p.protocol.srcAddr.length)
        let command = msg.readInt16BE(cts_p.protocol.command.offset, cts_p.protocol.command.length)
        let dataLength = msg.readInt16BE(cts_p.protocol.dataLength.offset, cts_p.protocol.dataLength.length)
        let data = msg.slice(cts_p.protocol.data.offset, cts_p.protocol.data.offset + dataLength)
        if (deviceModel == cts_p.speakUnitDest) {
            if(command == cts_p.deviceHeartCommand){
                let deviceHeart = this.handleData(data, cts_p.speakUnitHeartStructure)
                let tempDev = this.devices.find(dev => dev.mac == deviceHeart.mac);
                if (!tempDev) {
                    let tempDev = deviceHeart
                    tempDev.name = '发言单元' + parseInt(deviceHeart.devno);
                    tempDev.model = 'speakUnit',
                    tempDev.count = 0
                    this.devices.push(tempDev)
                    this.broadcastDevices(this.devices);
                } else {
                    tempDev.count = 0
                }
            }else if(command == cts_p.heartSign){
                let deviceHeart = this.handleData(data, cts_p.macStructure)
                let member = await MeetingService.devSign(deviceHeart.mac)
                socketIo.volatile.emit('sign', member);

            }else if(command == cts_p.heartVote){
                let deviceHeart = this.handleData(data, cts_p.voteStructure)
                let voteOption = await MeetingService.devVote(deviceHeart.mac, deviceHeart.option)
                socketIo.volatile.emit('vote', voteOption);
            }else if(command == cts_p.heartPermitSpeak){
                let devices = await Device.updateMany({model: 'speakUnit'}, {allowSpeak: true})
                socketIo.volatile.emit('speak', devices);
            }
            else if(command == cts_p.heartProhibitSpeak){
                let devices = await Device.updateMany({model: 'speakUnit'}, {allowSpeak: false})
                socketIo.volatile.emit('quiet', devices);
            }
            else if(command == cts_p.heartAskPort){
                let deviceHeart = this.handleData(data, cts_p.macStructure)
                let devices = await this.getCameraLo(null, deviceHeart.mac)
                socketIo.volatile.emit('camera', devices);
            }
        } else if (deviceModel == cts_p.hostDest) {
            let deviceHeart = this.handleData(data, cts_p.hostHeartStructure)
            if (deviceHeart.mastercpu == cts_p.hostHeartStructure.mastercpu.value.toString(16)) {
                let tempDev = this.devices.find(dev => dev.mac == deviceHeart.mac);
                if (!tempDev) {
                    let tempDev = deviceHeart
                    tempDev.name = '主机' + parseInt(deviceHeart.devno);
                    tempDev.model = 'host'
                    tempDev.count = 0
                    this.devices.push(tempDev)
                } else {
                    tempDev.count = 0
                }
            }
        }
    }

    /**
     * 处理udp具体数据
     * 
     * @param {any} data 
     * @param {any} dataStructure 
     * @memberof DeviceService
     */
    handleData(data, dataStructure) {
        let dataContent = new Object();
        for (let prop in dataStructure) {
            dataContent[prop] = data.slice(dataStructure[prop].offset, dataStructure[prop].offset + dataStructure[prop].length).toString('hex')
        }
        return dataContent
    }

    /**
     * 构造协议数据 
     * 
     * @param {any} structure 
     * @param {any} data 
     * @memberof DeviceService
     */
    structureData(structure, data) {
        let length = 0,
            offset = 9999;
        for (let prop in structure) {
            if (offset > structure[prop].offset) {
                offset = structure[prop].offset;
            }

            length += structure[prop].length;
            if (data && data[prop] != undefined) {
                structure[prop].value = data[prop]

            } else {
                if (prop == 'date') {
                    if (structure[prop].format == 'YYYYMMDDHHmmssd') {
                        structure[prop].value = moment().format("YYYYMMDDhhmmss") + '0' + moment().day()
                    } else {
                        structure[prop].value = moment().format(structure[prop].format);
                    }
                } else {
                    throw ({
                        message: '协议数据参数错误'
                    })
                }
            }

        }
        let dataProtocol = new Protocol(length, offset);
        dataProtocol.structureProtocol(structure);
        return dataProtocol.protocol;
    }

    /**
     * socket广播设备
     * 
     * @memberof DeviceService
     */
    broadcastDevices() {
        socketIo.volatile.emit('devices', this.devices);
    }

    /**
     * 搜寻设备
     * 
     * @memberof DeviceService
     */
    searchDevice() {

    }

    /**
     * 初始化设备
     * 
     * @memberof DeviceService
     */
    generateDevice() {

    }

    /**
     * 发送设备协议
     * 
     * @param {any} dest 
     * @param {any} origin 
     * @param {any} command 
     * @param {any} priority 
     * @param {any} data 
     * @param {any} dataStructure 
     * @param {any} port 
     * @memberof DeviceService
     */
    sendDeviceProtocol(dest, origin, command, priority, data, dataStructure) {
        let content
        if (data) {
            content = this.structureData(dataStructure, data)
        } else {
            content = Buffer.from([])
        }

        let protocol = new DeviceProtocol(dest, origin, command, priority, content)
        return new Promise(function(res, rej){
            protocol.sendProtocol(port, '255.255.255.255', function (msg) {
                console.log(msg)
                res(msg)
            })
        }) 
    }
}
module.exports = new DeviceService();