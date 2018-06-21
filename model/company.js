const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const MusicSchema = new Schema({
    name: String,
    url: String,
    bit: String,
    updateMusic: String,
    size: String,
})

const CompanySchema = new Schema({
    name: { type: String},
    avatar: { type: String },
    boss: { 
        type: ObjectId,
        ref: 'User'  
    }, 
    bossName: { type: String },
    departments: [{ type: ObjectId, ref: "Department" }],
    openTime: {type: String, deafault: "00:00"},
    closeTime: {type: String, deafault: "23:59"},
    meetingInteval: {type: Number, default: 30}, // 会议时间片 30分钟
    meetingRooms: [{ 
        type: ObjectId,
        ref: "MeetingRoom" 
    }],
    meetings:[{
        type: ObjectId,
        ref: "Meeting",
    }],
    musics:[MusicSchema],
})

const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;