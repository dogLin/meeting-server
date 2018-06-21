const Company = require('../model/company');
const Device = require('../model/device');
const MeetingRoom = require('../model/meetingRoom');
const isEqualWith = require('lodash/isEqualWith')
const dbUtils = require('../utils/db')
const constants = require('../utils/constants')
const { deleteFile } = require('../upload')

class MeetingRoomService {

    /**
     * 依据公司查询会议室
     * 
     * @param {any} corpId 
     * @returns 
     * @memberof MeetingRoomService
     */
    async queryMeetingRoomByCompany(corpId) {
        let meetingRoomIdList = await Company.findById(corpId, 'meetingRooms');
        return MeetingRoom.where('_id').in(meetingRoomIdList.meetingRooms).populate('openUsers');
    }

    /**
     * 依据用户查询会议室
     * 
     * @param {any} corpId 
     * @returns 
     * @memberof MeetingRoomService
     */
    async queryMeetingRoomByUser(corpId, userId) {
        let meetingRoomIdList = await Company.findById(corpId, 'meetingRooms');
        let MeetingRoomQuery = MeetingRoom.find();
        return MeetingRoomQuery.where('_id').in(meetingRoomIdList.meetingRooms).or([{type: '通用'}, {type: '指定人员', openUsers: userId}]).populate('openUsers').exec()
        //return MeetingRoom.where('type', '指定人员').where('openUsers', userId);
    }

    /**
     * 依据部门查询会议室
     * 
     * @param {any} corpId 
     * @returns 
     * @memberof MeetingRoomService
     */
    async queryMeetingRoomByDep(corpId, depId) {
        let meetingRoomIdList = await Company.findById(corpId, 'meetingRooms');
        let MeetingRoomQuery = MeetingRoom.find();
        return MeetingRoomQuery.where('_id').in(meetingRoomIdList.meetingRooms).or([{type: '通用'}, {type: '指定部门', openDep: depId}]).exec()
        //return MeetingRoom.where('type', '指定部门').where('openDep', depId);
    }

    /**
     * 新增会议室
     * 
     * @param {any} roomReq 
     * @memberof MeetingRoomService
     */
    async saveMeetingRoom(deviceId, companyId, roomReq) {
        let uniqueField = {
            key: 'name',
            value: roomReq.name
        }
        if(await dbUtils.checkExist(MeetingRoom, uniqueField)){
            deleteFile(roomReq.avatar)
            
            return {
                success: false,
                msg: "会议室重名"
            }
        }
        else {
            roomReq.avatar = roomReq.avatar ?　roomReq.avatar : constants.user_default_avatar
            let meetingRoomRes = await MeetingRoom.create(roomReq);
            await this.updateCom(companyId, meetingRoomRes._id)
            if(deviceId){
                await this.updateDevice(deviceId, meetingRoomRes._id)
            }
            
            return meetingRoomRes;
        }
    }

    /**
     * 编辑会议室
     * 
     * @param {any} roomId 
     * @param {any} room 
     * @returns 
     * @memberof MeetingRoomService
     */
    async mdfMeetingRoom(roomId, room){
        try {
            let roomDoc = await MeetingRoom.findById(roomId);
            if(roomDoc){
                for (var prop in room) {
                    if(!isEqualWith(room[prop], roomDoc[prop])){
                        roomDoc[prop] = room[prop];
                    }
                }
                return roomDoc.save();
            } else {
                return {
                    success: false,
                    msg: '会议室不存在'
                }
            }
            
        } catch (error) {
            throw (error)
        }
    }

    /**
     * 删除会议室
     * 
     * @param {any} roomId 
     * @returns 
     * @memberof MeetingRoomService
     */
    async delRoom(companyId, roomId) {
        try {
            return await Company.update({_id: companyId}, {$pull: {meetingRooms: roomId}});
        } catch (error) {
            throw(error)
        }
        
    }

    /**
     * 将会议室加入公司中
     * 
     * @memberof MeetingRoomService
     */
    async updateCom(companyId, roomId) {
        try {
            return await Company.update({_id: companyId}, {$push: {meetingRooms: roomId}});
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 将会议室绑定到设备中
     * 
     * @param {any} deviceId 
     * @param {any} roomId 
     * @memberof MeetingRoomService
     */
    async updateDevice(deviceId, roomId) {
        try {
            return await Device.update({_id: deviceId}, {room: roomId});
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 将会议室从公司删除
     * 
     * @param {any} companyId 
     * @param {any} roomId 
     * @memberof MeetingRoomService
     */
    async updateComDel(companyId, roomId){
        //let company = await Company.where('meetingRooms', roomId)
        return Company.update({_id : companyId}, {$pull: {"meetingRooms":roomId}})
    }

}

module.exports = new MeetingRoomService();