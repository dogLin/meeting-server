require("./db");
const User = require('./user');
const MeetingRoom = require('./meetingRoom');
const Meeting = require('./meeting');
const Company = require('./company');
const moment = require('moment');
moment.locale('zh-cn');
const bcrypt = require("bcrypt");
const Department = require('./department');

genarateData = async () => {
    //await User.remove();
    let user = new User();
    user.userName = 'chenwei';
    user.name = '陈伟';
    user.pass = bcrypt.hashSync('123', 6);
    user.email = '389187576@qq.com'
    user.phone = '110';
    await user.save();
    console.log("初始化用户成功");
    let defaultUser = await findOneUser('陈伟')
    let defaultCom =  await generateCompany(defaultUser)
    await generateMeetingRoom(defaultUser, defaultCom)
    let defaultMeetingRoom = await findOneMeetingRoom('默认会议室')
    let result = await generateMeeting(defaultMeetingRoom, defaultUser)
    console.log(result);
}

function findOneUser(username) {
    return User.findOne({
        name: username
    });
}

function findOneMeetingRoom(meetingRoomName) {
    return MeetingRoom.findOne({
        name: meetingRoomName
    });
}

// genarateData();

generateCompany = async (defaultUser) => {
    let company = {
        name: '中协智能',
        avatar: 'cvi',
        boss: defaultUser._id,
        bossName: defaultUser.name,
        departments: [],
        meetingRooms: [],
        meetings: [],
        musics: []
    }
    try {
        await Company.remove();
        return Company.create(company);
    }
     catch (error) {
        console.log(error)
    }
}

generateMeetingRoom = async (defaultUser, defaultCom) => {
    let meetingRooms = [{
        name: '默认会议室',
        place: '三〇一室',
        desc: '保密会议',
        avatar: '',
        holdNums: 30,
        openUsers: [defaultUser._id],
        devices: [],
        meetings: []
    },{
        name: '会议室1',
        place: '三〇2室',
        desc: '普通会议',
        avatar: '',
        holdNums: 10,
        openUsers: [],
        devices: [],
        meetings: []
    }]
    try {
        await MeetingRoom.remove();
        let meetingRooms = await MeetingRoom.create(meetingRooms);
        await Company.findByIdAndUpdate(defaultCom._id, {meetingRooms: meetingRooms.map(meetingRoom=>meetingRoom._id)})
        console.log("初始化会议室成功");
    } catch (error) {
        console.log(error)
    }
}

generateMeeting = async (defaultMeetingRoom, members) => {
    let time = moment().format()
    console.log(moment().utcOffset(9).format())
    console.log(moment.utc().format())
    let meeting = {
        name: '一个会议',
        meetingRoom: defaultMeetingRoom._id,
        desc: '中午吃啥',
        startTime: moment(new Date(2018,4,8,8,0,0)),
        endTime: time,
        issues: '五',
        members: [{
            userId: members._id,
            isStarter: true,
            isHelper: true,
            isJoin: true,
            isSign: true,
            signTime: '1dian',
        }],
        tasks: [],
        files: [],
        status: '预约',
        votes: [],
        minutes: '60min',
    }
    try {
        await Meeting.remove();
        await Meeting.create(meeting);
        console.log("初始化会议成功");
        return "初始化数据成功"
    } catch (error) {
        //console.log(error)
        return error
    }
}
// genarateUser();

let a = new Department();
a.id =1 ;
a.save();
