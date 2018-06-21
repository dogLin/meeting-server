const MeetingService = require('../../service/meetingService');
const DeviceService = require('../../service/deviceService');
const DingNotify = require('../../Ding/notify')
const { uploadFile } = require('../../upload')
const uploadConfig = require('../../config').upload

class MeetingController {

    /**
     * 预约会议
     * 
     * @static
     * @param {any} ctx 
     * @param {any} next 
     * @memberof MeetingController
     */
    static async orderMeeting(ctx, next) {
        let meetingReq = ctx.request.body
        try {
            if(meetingReq && meetingReq.meetingRoom && meetingReq.name){
                let meeting = await MeetingService.addMeeting(meetingReq);
                if(meeting){
                    await MeetingService.updateRoomMeeting(meeting);
                    ctx.body = {
                        success: true,
                        data: meeting,
                        msg: "预约会议成功"
                    }
                }
            } else {
                ctx.throw(400, {
                    message: "参数错误"
                })
            }
        } catch (error) {
            throw (error)
        }
    }

    /**
     * 编辑会议
     * 
     * @static
     * @param {any} ctx 
     * @param {any} next 
     * @memberof MeetingController
     */
    static async updateMeeting(ctx, next) {
        let meetingReq = ctx.request.body, meetingId = ctx.params.id;
        try {
            let meeting = await MeetingService.mdfMeeting(meetingId, meetingReq);
            if(meeting){
                ctx.body = {
                    success: true,
                    data: meeting,
                    msg: "编辑会议成功"
                }
            }
            else {
                ctx.throw(500, {
                    message: "服务内部错误"
                })
            }
        } catch (error) {
            throw (error)
        }
    }

    /**
     * 删除会议
     * 
     * @static
     * @param {any} ctx 
     * @param {any} next 
     * @memberof MeetingController
     */
    static async deleteMeeting(ctx, next) {
        let meetingId = ctx.params.id
        try {
            let delMeetingRes = await MeetingService.delMeeting(meetingId);
            if (delMeetingRes) {
                ctx.body = {
                    success: true,
                    msg: "删除会议成功"
                }
            } else {
                ctx.throw(400, {
                    message: "删除的会议不存在"
                })
            }
        } catch (error) {
            throw (error)
        }
    }

    /**
     * 查询会议
     * 
     * @static
     * @param {any} ctx 
     * @param {any} next 
     * @memberof meetingController
     */
    static async getRoomsMeeting(ctx, next) {
        let userId = ctx.state.user.data._id;
        let options = ctx.query;
        options.userId = userId;
        try {
            await MeetingService.checkMeeting();
            let meetings = await MeetingService.queryMeeting(options)

            if(meetings){
                ctx.body = {
                    success: true,
                    data: meetings,
                    msg: "查询会议成功"
                }
            }
            else {
                ctx.throw(500, {
                    message: "服务内部错误"
                })
            }
            
        } catch (error) {
            throw error
        }
    }

    /**
     * 确认参加会议
     * 
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async joinMeeting(ctx) {
        let userId = ctx.state.user.data._id, meetingId = ctx.request.body.meetingId;
        try {
            let meeting = await MeetingService.joinMeeting(meetingId, userId);
            if(meeting){
                ctx.body = {
                    success: true,
                    data: meeting,
                    msg: "加入会议成功"
                }
            }
            else {
                ctx.throw(500, {
                    message: "服务内部错误"
                })
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 查询会议室所有会议
     * 
     * @static
     * @param {any} ctx 
     * @param {any} next 
     * @memberof meetingController
     */
    static async getAllRoomsAllMeetingByUser(ctx, next) {
        let userId = ctx.state.user.data._id, company = ctx.state.user.data.company, {date} = ctx.query;
        try {
            await MeetingService.checkMeeting();
            let meetings = await MeetingService.queryMeetingGroupByRoom(company, userId, date)

            if(meetings){
                ctx.body = {
                    success: true,
                    data: meetings,
                    msg: "查询会议成功"
                }
            }
            else {
                ctx.throw(500, {
                    message: "服务内部错误"
                })
            }
            
        } catch (error) {
            throw error
        }
    }

    /**
     * 开始会议
     * 
     * @static
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async startMeeting(ctx) {
        let priority = ctx.state.user.data.priority || 101,{meetingId} = ctx.request.body;
        if(priority && meetingId) {
            try {
                await DeviceService.delAllMember(priority)
                let meetingRes = await MeetingService.startMeeting(meetingId)
                let memberDoc = meetingRes ? meetingRes.members : [];
                if(memberDoc && memberDoc.length>0){
                    let downMemberProList = memberDoc.map(member=> {
                        let memberDown = {}
                        memberDown.username = member.userId.name
                        memberDown.mac = member.device ? member.device.mac : ''
                        if(member.isBoss){
                            memberDown.professor = '老板'
                        } else if(member.isLeader){
                            memberDown.professor = '经理'
                        } else {
                            memberDown.professor = '员工'
                        }
                        memberDown.sex = 'M'
                        return DeviceService.downMember(priority, memberDown)
                    })
                    await Promise.all(downMemberProList)
                }

                await DeviceService.startSign(priority)
                if(meetingRes) {
                    ctx.body = {
                        success: true,
                        data: meetingRes,
                        msg: '开始会议'
                    }
                }
                else {
                    ctx.throw({msg: '会议已开始'})
                }
            } catch (error) {
                throw(error)
            }
            
        }
    }

    /**
     * 结束会议
     * 
     * @static
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async endMeeting(ctx) {
        let priority = ctx.state.user.data.priority || 101,{meetingId} = ctx.request.body;
        if(priority && meetingId) {
            try {
                let meetingRes = await MeetingService.endMeeting(meetingId)
                await DeviceService.endSign(priority)
                await DeviceService.endVote(priority)
                await DeviceService.delAllMember(priority)
                if(meetingRes) {
                    ctx.body = {
                        success: true,
                        data: meetingRes,
                        msg: '结束会议'
                    }
                }
            } catch (error) {
                throw(error)
            }
            
        }
    }

    /**
     * 会议签到
     * 
     * @static
     * @param {any} ctx 
     * @param {any} next 
     * @memberof MeetingController
     */
    static async meetingSign(ctx, next) {
        let userId = ctx.state.user.data._id,
            priority = ctx.state.user.data.priority || 101,
            {
                meetingId,
                signTime,
                mac
            } = ctx.request.body;
        if (userId && signTime && meetingId) {
            try {
                let deviceRes = await DeviceService.sign(priority, {mac})
                let signRes = await MeetingService.sign(userId, signTime, meetingId);
                if (signRes == 'sign') {
                    ctx.body = {
                        success: true,
                        msg: '签到成功'
                    }
                } else if(signRes == 'signed') {
                    ctx.throw(400, {
                        message: "已签到"
                    })
                } else if(signRes == 'delay') {
                    ctx.body = {
                        success: true,
                        msg: '迟到签到'
                    }
                } else if(signRes == 'hurry') {
                    ctx.body = {
                        success: true,
                        msg: '会议未开始'
                    }
                }
            } catch (error) {
                throw(error)
            }
            
        }
        else{
            ctx.throw(400, {
                message: "请求参数错误"
            })
        }
    }

    /**
     * 会议通知
     * 
     * @static
     * @memberof MeetingController
     */
    static meetingMotify(ctx){
        let message = {
            "touser": "UserID1|UserID2",
            "agentid": "1",
            "code":"code", // 临时授权码
            "msgtype":"text",
            "text":{
                "content": "张三的请假申请"
            }
        }
        DingNotify.sendByCode(token, message);
    }

    /**
     * 发起表决
     * 
     * @static
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async meetingVote(ctx){
        let {meetingId, voteContent} = ctx.request.body, priority = ctx.state.user.data.priority || 101;
        try {
            let devRes = await DeviceService.startVote(priority)
            let voteRes = await MeetingService.initiateVote(meetingId, voteContent)
            if(voteRes.n > 0){
                ctx.body = {
                    success: true,
                    msg: '发起投票成功',
                    data: voteRes
                }
            }
            else{
                ctx.throw(400, {
                    message: "会议不存在"
                })
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 结束投票
     * 
     * @static
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async endMeetingVote(ctx) {
        let {meetingId, voteId} = ctx.request.body, priority = ctx.state.user.data.priority || 101;
        try {
            let devRes = await DeviceService.endVote(priority)
            let voteRes = await MeetingService.endVote(meetingId, voteId)
            if(voteRes){
                ctx.body = {
                    success: true,
                    msg: '结束投票成功',
                    data: voteRes
                }
            }
            else{
                ctx.throw(500)
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 查询会议投票结果
     * 
     * @static
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async getVote(ctx){
        let {meetingId} = ctx.query;
        try {
            let voteRes = await MeetingService.queryVote(meetingId)
            if(voteRes){
                ctx.body = {
                    success: true,
                    msg: '查询投票成功',
                    data: voteRes
                }
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 删除投票
     * 
     * @static
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async delMeetingVote(ctx){
        let voteId = ctx.params.id;
        try {
            let voteRes = await MeetingService.delVote(voteId);
            if(voteRes){
                ctx.body = {
                    success: true,
                    msg: '删除投票成功',
                    data: voteRes
                }
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 用户投票
     * 
     * @static
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async userVote(ctx){
        let voteReq = ctx.request.body, priority = ctx.state.user.data.priority || 101, {mac, option} = voteReq;
        voteReq.userId = ctx.state.user.data._id;
        let data = {mac:voteReq.mac, option:0x00}
        if(voteReq.command == true) {
            data.option = 0x01
        } else if(voteReq.command == '否定') {
            data.option = 0x02
        }
        try {
            let devRes = await DeviceService.vote(priority, data)
            let voteRes = await MeetingService.vote(voteReq)
            if(voteRes){
                if(voteRes.code == 555){
                    ctx.throw(400, {
                        message: voteRes.msg
                    })
                }
                ctx.body = {
                    success: true,
                    msg: '投票成功',
                    data: voteRes
                }
            }
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 上传附件
     * 
     * @static
     * @param {any} ctx 
     * @memberof MeetingController
     */
    static async uploadAttachment(ctx) {
        try {
            let uploadRes = await uploadFile(ctx.req,{fileType: 'attachment', path: uploadConfig.path});
            let file = {};
            file.name = uploadRes.filename;
            file.url = uploadRes.path;
            let meetingRes = await MeetingService.saveAttachment(uploadRes.formData.meetingId, file)
            if(meetingRes){
                    ctx.body = {
                        success: true,
                        msg: '上传附件成功',
                        data: meetingRes
                    }
                }
        } catch (error) {
            throw(error)
        }
        
    }

}

module.exports = MeetingController