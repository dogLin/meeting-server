const MeetingRoomService = require('../../service/meetingRoomService');
const MeetingService = require('../../service/meetingService');
const compact = require('lodash/compact')
const path = require('path')
const {
    uploadFile,
    deleteFile
} = require('../../upload')
const uploadConfig = require('../../config').upload

/**
 * 获取用户会议室
 * 
 * @param {any} ctx 
 * @param {any} next 
 * @returns 
 */
getMeetingRoomByUser = async (ctx) => {
    try {
        let userId = ctx.state.user.data._id,
            corpId = ctx.state.user.data.company;
        let meetingRooms = await MeetingRoomService.queryMeetingRoomByUser(corpId, userId)
        if (meetingRooms) {
            ctx.body = {
                success: true,
                data: meetingRooms,
                msg: '返回会议室'
            }
        } else {
            ctx.body = {
                success: false,
                msg: '企业不存在'
            }
        }

    } catch (error) {
        throw (error)
    }
}

/**
 * 获取企业会议室
 * 
 * @param {any} ctx 
 * @param {any} next 
 * @returns 
 */
getMeetingRoomByCompany = async (ctx, next) => {
    try {
        let corpId = ctx.state.user.data.company;
        let meetingRooms = await MeetingRoomService.queryMeetingRoomByCompany(corpId)
        if (meetingRooms) {
            ctx.body = {
                success: true,
                msg: meetingRooms
            }
        } else {
            ctx.body = {
                success: false,
                msg: '企业不存在'
            }
        }

    } catch (error) {
        throw (error)
    }
}


/**
 * 新增企业会议室
 * 
 * @param {any} ctx 
 * @param {any} next 
 * @returns 
 */
addMeetingRoom = async (ctx, next) => {
    let companyId = ctx.state.user.data.company;
    if (!companyId) {
        ctx.throw(401)
    }
    try {
        let uploadRes = await uploadFile(ctx.req, {
            fileType: 'images',
            path: uploadConfig.path
        });
        let meetingRoomReq = uploadRes.formData;
        meetingRoomReq.avatar = uploadRes.path;
        let deviceId = meetingRoomReq.devices ? meetingRoomReq.devices[0] : ''

        let meetingRoomRes = await MeetingRoomService.saveMeetingRoom(deviceId, companyId, meetingRoomReq);
        if (meetingRoomRes) {
            if (meetingRoomRes.msg == '会议室重名') {
                ctx.body = meetingRoomRes
            } else {
                ctx.body = {
                    success: true,
                    data: meetingRoomRes,
                    msg: "新增会议室成功"
                }
            }
        } else {
            ctx.throw(500)
        }

    } catch (error) {
        throw (error)
    }
}

/**
 * 修改企业会议室
 * 
 * @param {any} ctx 
 * @param {any} next 
 * @returns 
 */
updateMeetingRoom = async (ctx, next) => {
    let meetingRoomId = ctx.params.id;
    if (!meetingRoomId) {
        ctx.throw(400, {
            message: "会议室Id不能为空"
        })
    }
    try {

        let uploadRes = await uploadFile(ctx.req, {
            fileType: 'images',
            path: uploadConfig.path
        });
        let meetingRoomReq = uploadRes.formData;
        if (uploadRes.path) {
            meetingRoomReq.avatar = uploadRes.path;
        }

        let meetingRoomRes = await MeetingRoomService.mdfMeetingRoom(meetingRoomId, meetingRoomReq)
        if (meetingRoomRes) {
            if (meetingRoomRes.msg == '会议室不存在') {
                ctx.body = meetingRoomRes
            } else {
                ctx.body = {
                    success: true,
                    data: meetingRoomRes,
                    msg: "修改会议室成功"
                }
            }
        } else {
            ctx.body = {
                success: false,
                msg: "会议室不存在"
            }
        }

    } catch (error) {
        throw (error)
    }
}

/**
 * 删除企业会议室
 * 
 * @param {any} ctx 
 * @param {any} next 
 * @returns 
 */
deleteMeetingRoom = async (ctx, next) => {
    let meetingRoomId = ctx.params.id,
        companyId = ctx.state.user.data.company;
    if (!meetingRoomId) {
        ctx.throw(400, {
            message: "会议室Id不能为空"
        })
    }
    if (!companyId) {
        ctx.throw(401)
    }
    try {
        let delMeetingRoomRes = await MeetingRoomService.delRoom(companyId, meetingRoomId);
        if (delMeetingRoomRes) {
            ctx.body = {
                success: true,
                msg: "删除会议室成功"
            }
        } else {
            ctx.body = {
                success: false,
                msg: "会议室不存在"
            }
        }

    } catch (error) {
        throw (error)
    }
}

/**
 * 查询可用会议室
 * 
 * @param {any} ctx 
 * @param {any} next 
 * @returns 
 */
queryMeetingRoom = async (ctx, next) => {
    let options = ctx.query;
    let userId = ctx.state.user.data._id,
        corpId = ctx.state.user.data.company;

    try {
        let meetingRooms = await MeetingRoomService.queryMeetingRoomByUser(corpId, userId);
        let useRoom = meetingRooms.map(async (room) => {
            if (!options.holdNums || room.holdNums >= options.holdNums) {
                if (!options.startTime && !options.endTime) {
                    return room;
                } else {
                    options.meetingRoom = room._id;
                    let meetings = await MeetingService.queryMeeting(options);
                    if (meetings.length == 0) {
                        return room;
                    }
                }
            }
        })
        useRoom = compact(await Promise.all(useRoom))
        if (useRoom) {
            ctx.body = {
                success: true,
                data: useRoom
            }
        } else {
            ctx.throw(500)
        }
    } catch (error) {
        throw(error)
    }

}

module.exports = {
    getMeetingRoom: getMeetingRoomByUser,
    getComMeetingRoom: getMeetingRoomByCompany,
    addMeetingRoom: addMeetingRoom,
    updateMeetingRoom: updateMeetingRoom,
    deleteMeetingRoom: deleteMeetingRoom,
    checkRoom: queryMeetingRoom
}