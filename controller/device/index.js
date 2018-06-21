const DeviceService = require('../../service/deviceService');

class DeviceController {

    /**
     * 查询设备
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async getDevice(ctx) {
        await DeviceService.checkDevices(ctx.state.user.data)
        let options = ctx.query
        let devices = await DeviceService.queryDevices(ctx.state.user.data, options)
        if (devices) {
            ctx.body = {
                success: true,
                data: devices,
                msg: '返回设备'
            }
        } else {
            ctx.throw(500)
        }
    }

    /**
     * 修改设备
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async deviceConfigure(ctx) {
        let {
            mac,
            name,
            devno,
            ip,
            netmask,
            gateway,
            dns
        } = ctx.request.body, priority = ctx.state.user.data.priority || 101
        let burnRes = await DeviceService.burnDevice(priority, {
            mac,
            devno
        })
        let netRes = await DeviceService.netDevice(priority, {
            mac,
            ip,
            netmask,
            gateway,
            dns
        })
        if (burnRes && netRes) {
            ctx.body = {
                success: true,
                msg: '配置设备参数成功'
            }
        } else {
            ctx.throw(500)
        }

    }

    /**
     * 初始化设备
     * 
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static initDevice(ctx) {

    }

    /**
     * 调音
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async tone(ctx) {
        let {
            volume,
            operate
        } = ctx.request.body,
            priority = ctx.state.user.data.priority || 101;
        if (operate == 0) {
            let res = await DeviceService.adjustVolume(priority, {
                volume
            })
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '发言单元调音'
                }
            } else {
                ctx.throw(500)
            }
        } else if (operate == 1) {
            let res = await DeviceService.adjustChannelVolume(priority, {
                volume
            })
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '音乐通道调音'
                }
            } else {
                ctx.throw(500)
            }
        }
    }

    /**
     * 设备开关
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static deviceSwitch(ctx) {

    }

    /**
     * 发言模式
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async speakModel(ctx) {
        let {
            model
        } = ctx.request.body,
            priority = ctx.state.user.data.priority || 101;
        let res = await DeviceService.switchModel(priority, {
            model
        })
        if (res) {
            ctx.body = {
                success: true,
                data: res,
                msg: '发言模式切换'
            }
        } else {
            ctx.throw(500)
        }
    }

    /**
     * 发言单元控制
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async speakUnitContorl(ctx) {
        let {
            mac,
            operate
        } = ctx.request.body,
            priority = ctx.state.user.data.priority || 101;
        try {
            if (operate == 0) {
                let res = await DeviceService.prohibitSpeak(priority, {
                    mac
                })
                if (res) {
                    ctx.body = {
                        success: true,
                        data: res,
                        msg: '发言单元禁言'
                    }
                } else {
                    ctx.throw(500)
                }
            } else if (operate == 1) {
                let res = await DeviceService.permitSpeak(priority, {
                    mac
                })
                if (res) {
                    ctx.body = {
                        success: true,
                        data: res,
                        msg: '发言单元取消禁言'
                    }
                } else {
                    ctx.throw(500)
                }
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 烧写机号
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async burnDevice(ctx) {
        let {
            mac,
            devno
        } = ctx.request.body, priority = ctx.state.user.data.priority || 101
        try {
            let res = await DeviceService.burnDevice(priority, {
                mac,
                devno
            })
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '烧写机号'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 配置设备网络信息
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async netDevice(ctx) {
        let {
            mac,
            ip,
            netmask,
            gateway,
            dns
        } = ctx.request.body, priority = ctx.state.user.data.priority || 101
        try {
            let res = await DeviceService.netDevice(priority, {
                mac,
                ip,
                netmask,
                gateway,
                dns
            })
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '配置设备网络信息'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }

    }


    /**
     * 下发人员信息至发言单元
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async downMember(ctx) {
        let {
            username,
            mac,
            sex = 'M',
            professor
        } = ctx.request.body;
        let req = {
                username,
                mac,
                sex,
                professor
            },
            priority = ctx.state.user.data.priority || 101
        try {
            let res = await DeviceService.downMember(priority, req)
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '下发指定人员'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }


    }

    /**
     * 删除发言单元人员信息
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async delMember(ctx) {
        let {
            mac
        } = ctx.request.body
        let priority = ctx.state.user.data.priority || 101;
        try {
            let res = await DeviceService.delMember(priority, {
                mac
            })
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '删除指定人员'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 删除所有发言单元人员信息
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async delAllMember(ctx) {
        let priority = ctx.state.user.data.priority || 101;
        try {
            let res = await DeviceService.delAllMember(priority)
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '删除所有指定人员'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 指定主席台
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async appointRostrum(ctx) {
        let priority = ctx.state.user.data.priority || 101,
            {
                mac
            } = ctx.request.body
        try {
            let res = await DeviceService.setRostrum(priority, {
                mac
            })
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '指定主席台'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 取消主席台
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async dismissRostrum(ctx) {
        let priority = ctx.state.user.data.priority || 101,
            {
                mac
            } = ctx.request.body
        try {
            let res = await DeviceService.dismissRostrum(priority, {
                mac
            })
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '取消主席台'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 除主席台所有发言单元禁言
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async prohibitAllSpeak(ctx) {
        let priority = ctx.state.user.data.priority || 101;
        try {
            let res = await DeviceService.prohibitAllSpeak(priority)
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '除主席台所有发言单元禁言'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 除主席台所有发言单元解除禁言
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async permitAllSpeak(ctx) {
        let priority = ctx.state.user.data.priority || 101;
        try {
            let res = await DeviceService.permitAllSpeak(priority)
            if (res) {
                ctx.body = {
                    success: true,
                    data: res,
                    msg: '除主席台所有发言单元解除禁言'
                }
            } else {
                ctx.throw(500)
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 开启背景音乐通道
     * 
     * @static
     * @param {any} ctx 
     * @memberof DeviceController
     */
    static async ctrlChannel(ctx) {
        let {
            operate
        } = ctx.request.body,
            priority = ctx.state.user.data.priority || 101;
        try {
            if (operate == 0) {
                let res = await DeviceService.openChannel(priority)
                if (res) {
                    ctx.body = {
                        success: true,
                        data: res,
                        msg: '打开背景音乐通道'
                    }
                } else {
                    ctx.throw(500)
                }

            } else if (operate == 1) {
                let res = await DeviceService.closeChannel(priority)
                if (res) {
                    ctx.body = {
                        success: true,
                        data: res,
                        msg: '关闭背景音乐通道'
                    }
                } else {
                    ctx.throw(500)
                }
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 摄像头左移
     * 
     * @static
     * @memberof DeviceController
     */
    static async cameraMove(ctx){
        try {
            let result
            switch (ctx.request.body.operate){
                case 'left':
                result = await DeviceService.cameraLeft()
                break
                case 'right':
                result = await DeviceService.cameraRight()
                break
                case 'up':
                result = await DeviceService.cameraUp()
                break
                case 'down':
                result = await DeviceService.cameraDown()
                break
                case 'stop':
                result = await DeviceService.cameraStop()
                break
            }
            if(result){
                ctx.body = {
                        success: true,
                        data: result,
                        msg: '操作摄像头成功'
                    }
            }else{
                ctx.throw(500)
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 设置摄像头位置
     * 
     * @memberof DeviceService
     */
    static async setUpCameraLo(ctx){
        try {
            let {num , mac} = ctx.request.body
            let res = await DeviceService.setUpCameraLo(num , mac)
            if(res=='success'){
                ctx.body = {
                        success: true,
                        data: res,
                        msg: '设置摄像头成功'
                    }
            }else {
                ctx.throw(500)
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 调用摄像头位置
     * 
     * @memberof DeviceService
     */
    static async getCameraLo(ctx){
        try {
            let {num , mac} = ctx.request.body
            let res = await DeviceService.getCameraLo(num , mac)
            if(res=='success'){
                ctx.body = {
                        success: true,
                        data: res,
                        msg: '调用摄像头成功'
                    }
            }else {
                ctx.throw(500)
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 删除摄像头位置
     * 
     * @memberof DeviceService
     */
    static async delCameraLo(ctx){
        try {
            let {num , mac} = ctx.request.body
            if(num >= 0 && mac){
                let res = await DeviceService.delCameraLo(num , mac)
                if(res=='success'){
                    ctx.body = {
                            success: true,
                            data: res,
                            msg: '删除摄像头成功'
                        }
                }else {
                    ctx.throw(500)
                }
            }
            else {
                ctx.throw(400, {message: "参数错误"})
            }
        } catch (error) {
            throw(error)
        }
    }

}

module.exports = DeviceController