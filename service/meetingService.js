const MeetingRoom = require('../model/meetingRoom');
const MeetingRoomService = require('./meetingRoomService');
const Meeting = require('../model/meeting');
const Device = require('../model/device');
const moment = require('moment');
const {
    uploadFile
} = require('../upload')
const {
    queryEqual,
    qureyInArray,
    queryInRange,
    queryIn
} = require('../utils/db')
const isEqualWith = require('lodash/isEqualWith')
const isDate = require('lodash/isDate')
const isArray = require('lodash/isArray')
const socketIo = require('../utils/socket');
const type = require('../utils/type');

class MeetingService {

    /**
     * 新增会议
     * 
     * @param {any} meetingReq 
     * @returns 
     * @memberof MeetingService
     */
    addMeeting(meetingReq) {
        let meeting = this.organizeMeeting(meetingReq);
        return Meeting.create(meeting);
    }

    /**
     * 修改会议
     * 
     * @param {any} meetingId 
     * @param {any} meeting 
     * @returns 
     * @memberof MeetingService
     */
    async mdfMeeting(meetingId, meeting) {
        let meetingDoc = await Meeting.findById(meetingId);

        //可深层判断优化
        for (var prop in meeting) {
            if (meetingDoc[prop] !== undefined) {
                if (isDate(meetingDoc[prop])) {
                    meeting[prop] = moment(meeting[prop]).toDate();
                }
                if (!isEqualWith(meeting[prop], meetingDoc[prop])) {
                    if (isArray(meetingDoc[prop])) {
                        if (prop == 'members') {
                            meeting[prop] = meeting[prop].map(member => {
                                let {
                                    userId,
                                    isStarter = false,
                                    isHelper = false,
                                    isJoin = false,
                                    isSign = false,
                                    signTime
                                } = member;
                                return member = {
                                    userId,
                                    isStarter,
                                    isHelper,
                                    isJoin,
                                    isSign,
                                    signTime
                                };
                            })
                        }
                    }
                    meetingDoc[prop] = meeting[prop];
                }
            }
        }
        try {
            return meetingDoc.save();
        } catch (error) {
            throw (error)
        }
    }

    /**
     * 保存会议附件入库
     * 
     * @param {any} meetingId 
     * @param {any} file 
     * @memberof MeetingService
     */
    async saveAttachment(meetingId, file) {
        await Meeting.findByIdAndUpdate(meetingId, {
            $push: {
                files: file
            }
        });
        return Meeting.findById(meetingId)
    }

    /**
     * 删除会议
     * 
     * @param {any} meetingId 
     * @returns 
     * @memberof MeetingService
     */
    delMeeting(meetingId) {
        return Meeting.findByIdAndRemove(meetingId)
    }

    /**
     * 查询会议
     * 
     * @param {any} userId 
     * @param {any} options 
     * @memberof MeetingService
     */
    queryMeeting(options) {
        let meetingQuery = Meeting.find();

        if (options) {
            for (var prop in options) {
                if (options[prop] && meetingQuery.schema.path(prop)) {
                    switch (meetingQuery.schema.path(prop).instance) {
                        case 'Array':
                            break
                        case 'ObjectID':
                        case 'String':
                            meetingQuery = this.queryMeetingByEqual(meetingQuery, prop, options[prop])
                            break
                        case 'Number':
                            meetingQuery = this.queryMeetingByEqual(meetingQuery, prop, options[prop])
                    }
                }
            }
            if (options.startTime || options.endTime) {
                meetingQuery = this.queryMeetingByDate(meetingQuery, options.startTime, options.endTime)
            }
            /*if(options.holdNums){
                meetingQuery = this.queryMeetingByHoldNums(meetingQuery, options.holdNums)
            }*/
            if (options.userId) {
                meetingQuery = this.queryMeetingByUser(meetingQuery, options.userId);
            }
        }
        return meetingQuery.populate({
            path: 'members.userId'
        }).populate('meetingRoom').populate({path: 'members.device'}).exec();
    }

    /**
     * 加入会议
     * 
     * @param {any} userId 
     * @param {any} meetingId 
     * @memberof MeetingService
     */
    async joinMeeting(meetingId, userId) {
        let meetingDoc = await Meeting.findById(meetingId)
        let member = meetingDoc.members.find(member => member.userId.toString() == userId)
        member.isJoin = true
        return meetingDoc.save()
    }

    /**
     * 按会议室分组查询会议
     * 
     * @param {any} corpId 
     * @param {any} userId 
     * @param {any} date 
     * @returns 
     * @memberof MeetingService
     */
    async queryMeetingGroupByRoom(corpId, userId, date) {
        date = date || moment().format("YYYY-MM-DD")
        let startTime = moment(date, "YYYY-MM-DD").toDate(),
            endTime = moment(date, "YYYY-MM-DD").add(1, 'days').toDate()
        let meetingRooms = await MeetingRoomService.queryMeetingRoomByUser(corpId, userId)
        return MeetingRoom.where('_id').in(meetingRooms).populate([{
            path: 'meetings',
            match: {
                endTime: {
                    $gte: startTime
                },
                startTime: {
                    $lte: endTime
                }
            }
        }]).exec()
    }

    /**
     * 依据用户查询会议
     * 
     * @param {any} userId 
     * @returns 
     * @memberof MeetingService
     */
    queryMeetingByUser(query, userId) {
        let condition = {
            field: 'members',
            subField: 'userId',
            subValue: userId
        }

        return qureyInArray(query, condition);
    }

    /**
     * 依据时间查询会议
     * 
     * @param {any} query 
     * @param {any} startTime 
     * @param {any} endTime 
     * @returns 
     * @memberof MeetingService
     */
    queryMeetingByDate(query, startTime, endTime) {
        let condition = {
            start: startTime ? {
                field: 'endTime',
                value: moment(startTime).toDate(),
                equal: true
            } : '',
            end: endTime ? {
                field: 'startTime',
                value: moment(endTime).toDate(),
                equal: true
            } : '',
        }
        return queryInRange(query, condition)
    }

    /**
     * 依据可判断字段相等查询会议
     * 
     * @param {any} query 
     * @param {any} field 
     * @memberof MeetingService
     */
    queryMeetingByEqual(query, field, fieldValue) {
        let condition = {
            field: field,
            value: fieldValue
        };
        ((fieldValue) => {
            try {
                fieldValue = JSON.parse(fieldValue);
            } catch (error) {
                try {
                    fieldValue = eval(fieldValue)
                } catch (error) {
                    fieldValue = fieldValue
                }
            }
        })(fieldValue)

        if (type(fieldValue) == 'array') {
            return queryIn(query, condition)
        } else {
            return queryEqual(query, condition)
        }
    }

    /**
     * 将会议加入会议室中
     * 
     * @param {any} meeting 
     * @returns 
     * @memberof MeetingService
     */
    async updateRoomMeeting(meeting) {
        try {
            let meetingRoom = await MeetingRoom.findById(meeting.meetingRoom);
            if (meetingRoom) {
                meetingRoom.meetings.push(meeting._id);
                return meetingRoom.save();
            } else {
                return null;
            }

        } catch (error) {
            throw (error)
        }

    }

    /**
     * 开始会议
     * 
     * @param {any} meetingId 
     * @memberof MeetingService
     */
    async startMeeting(meetingId) {
        try {
            let meetingDoc = await Meeting.findById(meetingId).populate({path: 'members.userId'}).populate({path: 'members.device'})
            
            if(meetingDoc.status != '预约') {
                return false
            }
            meetingDoc.status = '进行中'
            await meetingDoc.save()
            return meetingDoc;
            
        } catch (error) {
            throw(error)
        }
        
    }

    /**
     * 结束会议
     * 
     * @param {any} meetingId 
     * @memberof MeetingService
     */
    async endMeeting(meetingId) {
        try {
            let meetingDoc = await Meeting.findById(meetingId)
            
            if(meetingDoc.status != '进行中') {
                return false
            }
            meetingDoc.status = '已结束'
            await meetingDoc.save()
            return meetingDoc;
        } catch (error) {
            throw(error)
        }
    }

    /**
     * 签到
     * 
     * @param {any} userId 
     * @param {any} signTime 
     * @param {any} meetingId 
     * @returns 
     * @memberof MeetingService
     */
    async sign(userId, signTime, meetingId) {
        try {
            let meetingDoc = await Meeting.findById(meetingId);
            let memberDoc = meetingDoc.members.find(member => member.userId == userId);
            if (!memberDoc.isSign) {
                memberDoc.signTime = moment(signTime);
                meetingDoc.save();
                let timeDiff = moment(signTime).diff(moment(meetingDoc.startTime), 'minutes');
                /*if (timeDiff > 10) {
                    return 'delay'
                } else */if (timeDiff < 0) {
                    return 'hurry'
                } else {
                    memberDoc.isSign = true;
                    meetingDoc.save();
                    return 'sign'
                }
            } else {
                return 'singed'
            }
        } catch (error) {
            throw (error)
        }

    }

    /**
     * 设备签到
     * 
     * @param {any} mac 
     * @returns 
     * @memberof MeetingService
     */
    async devSign(mac) {
        if(mac){
            try {
                let deviceDoc = await Device.findOne({mac: mac})
                let meetingDoc = await Meeting.findOne({'members.device': deviceDoc._id})
                let memberDoc = meetingDoc.members.find(member=>member.device.toString()==deviceDoc._id.toString())
                if(!memberDoc.isSign){
                    memberDoc.isSign = true
                    memberDoc.signTime = new Date()
                    await meetingDoc.save()
                    
                }
                return memberDoc;
                
            } catch (error) {
                throw(error)
            }
        }
    }

    /**
     * 设备表决
     * 
     * @param {any} mac 
     * @param {any} option 
     * @memberof MeetingService
     */
    devVote(mac, option) {
        return new Promise(async (res, rej) =>{
            if(mac, option){
            try {
                let deviceDoc = await Device.findOne({mac: mac})
                if(deviceDoc) {
                    console.log('11111111111')
                    let meetingDoc = await Meeting.findOne({'members.device': deviceDoc._id}).populate({path: 'members.userId'}).populate({path: 'members.device'})
                    console.log('444444444444')
                    if(meetingDoc) {
                        let voteDoc = meetingDoc.votes.find(vote=>vote.status=='进行中');
                        let memberDoc = meetingDoc.members.find(member=>member.device.mac==mac);
                        
                        if (voteDoc && voteDoc.options.find(option=>option.voter.find(val => val.user.toString() == memberDoc.userId.toString()))) {
                            res({
                                code: 555,
                                msg: '用户已投票'
                            }) 
                        }
                        else if(voteDoc && memberDoc){
                            let voter = {
                                user: memberDoc.userId._id,
                                info: '设备表决'
                            }
                            
                            if(option=='01') {
                                console.log('222222222222')
                                let optionDoc = voteDoc.options[0]
                                optionDoc.count++;
                                optionDoc.voter.push(voter);
                                this.broadcastVoteMsg(optionDoc)
                                await meetingDoc.save()
                                console.log('55555555555555')
                            }
                            else if(option=='02'){
                                console.log('3333333333333')
                                let optionDoc = voteDoc.options[1]
                                optionDoc.count++;
                                optionDoc.voter.push(voter);
                                this.broadcastVoteMsg(optionDoc)
                                await meetingDoc.save()
                                console.log('6666666666')
                            }
                            else{
                                console.log('777777777777')
                            }
                            res(voteDoc) 
                        }
                    }
                }

                
            } catch (error) {
                    throw(error)
                }
            }
        })
        
    }

    /**
     * 发起投票
     * 
     * @param {any} meetingId 
     * @param {any} voteContent 
     * @memberof MeetingService
     */
    async initiateVote(meetingId, voteContent) {
        if (meetingId && voteContent) {
            let meetingDoc = await Meeting.findById(meetingId)
            let vote = meetingDoc.votes.find(vote=> vote.status=='进行中');
            if(vote){
                vote.status = '已结束';
                await meetingDoc.save()
            }
            return Meeting.update({
                _id: meetingId
            }, {
                $addToSet: {
                    votes: voteContent
                }
            })
        }
    }

    /**
     * 结束投票
     * 
     * @param {any} meetingId 
     * @param {any} voteId 
     * @returns 
     * @memberof MeetingService
     */
    async endVote(meetingId, voteId) {
        if (meetingId && voteId) {
            let meetingDoc = await Meeting.findById(meetingId)
            let voteDoc = meetingDoc.votes.id(voteId)
            voteDoc.status = '已结束'
            return meetingDoc.save()
        }
    }

    /**
     * 查询投票
     * 
     * @param {any} meetingId 
     * @returns 
     * @memberof MeetingService
     */
    async queryVote(meetingId) {
        if (meetingId) {
            let meetingDoc = await Meeting.findById(meetingId)
            return meetingDoc.votes;
        }
    }

    /**
     * 删除投票
     * 
     * @param {any} voteId 
     * @returns 
     * @memberof MeetingService
     */
    async delVote(voteId) {
        if (voteId) {
            let meetingDoc = await Meeting.findOne({
                'votes._id': voteId
            })
            meetingDoc.votes.id(voteId).remove();
            return meetingDoc.save()
            //return Meeting.findById(meetingId).votes.id(voteId).remove()
        }
    }

    /**
     * 用户投票
     * 
     * @param {any} meetingId 
     * @param {any} voter 
     * @param {any} optionId 
     * @memberof MeetingService
     */
    async vote(voteReq) {
        let {
            voteId,
            optionId,
            userId,
            message
        } = voteReq;
        let voter = {
            user: userId,
            info: message
        }
        if (voteId && optionId) {
            //let meetingDoc = await Meeting.findById(meetingId)
            let meetingDoc = await Meeting.findOne({
                'votes.options._id': optionId
            })
            if(meetingDoc) {
                let optionDoc = meetingDoc.votes.id(voteId).options.id(optionId)

                if (optionDoc.voter.find(val => val.user == voter.user)) {
                    return {
                        code: 555,
                        msg: '用户已投票'
                    }
                } else {
                    optionDoc.count++;
                    optionDoc.voter.push(voter);
                    this.broadcastVoteMsg(optionDoc)
                }
                return meetingDoc.save()
            }
            
        }
    }

    /**
     * 
     * 
     * @memberof MeetingService
     */
    async broadcastVoteMsg(option) {
        socketIo.volatile.emit('vote', option);
    }

    /**
     * 组织会议数据
     * 
     * @param {any} meeting 
     * @memberof MeetingController
     */
    organizeMeeting(meetingReq) {
        let {
            issues = [], tasks = [], name = '', meetingRoom = '', desc = '', startTime = moment(), endTime = moment(), members = [], files = [], status = '预约', votes = [], minutes = ''
        } = meetingReq;
        let meeting = {
            issues,
            tasks,
            name,
            meetingRoom,
            desc,
            startTime,
            endTime,
            members,
            files,
            status,
            votes,
            minutes
        }
        meeting.startTime = moment(meeting.startTime);
        meeting.endTime = moment(meeting.endTime);
        meeting.members.map(member => {
            member.isStarter = member.isStarter || false;
            member.isHelper = member.isHelper || false;
            member.isJoin = member.isJoin || false;
            member.isSign = member.isSign || false;
            member.signTime = '';
        })

        return meeting
    }

    async checkMeeting(query) {
        let now = new Date();
        let meetings = await Meeting.find({
            endTime: {
                $lte: now
            },
            status: {
                $nin: ["已结束", "已取消"]
            }
        }).update({
            status: '已结束'
        })
    }
}

module.exports = new MeetingService()