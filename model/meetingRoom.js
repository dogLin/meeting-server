const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const IPv4 = require('../utils/os')

const ObjectId = Schema.Types.ObjectId;

const MeetingRoomSchema = new Schema({
    name: { type: String, unique: true},
    type: {
        type: String,
        enum: ["通用","指定部门","指定人员"]
    },
    place: { type: String},
    desc: { type: String},
    avatar: { type: String },
    holdNums: {type: Number},
    openUsers: [{
        type: ObjectId,
        ref: "User"
    }],
    openDep: [{
        type: ObjectId,
        ref: "Department"
    }],
    devices:[{
        type: ObjectId,
        ref: "Device"
    }],  //设备暂定
    meetings:[{
        type: ObjectId,
        ref: "Meeting",
    }],
})

MeetingRoomSchema.pre('find', function(){
    this.start = Date.now();
})
MeetingRoomSchema.post('find', function(result) {
  // prints number of milliseconds the query took
  console.log('find() took ' + (Date.now() - this.start) + ' millis');
  let port = process.env.PORT || '3000'
  result.map(room => {
      room.avatar = room.avatar ? 'http://' + IPv4.address + ':' + port + '/' + room.avatar : ''
  })
});

MeetingRoomSchema.pre('save', function(next) {
  // 做些什么

  next();
});

const MeetingRoom = mongoose.model("MeetingRoom", MeetingRoomSchema);

module.exports = MeetingRoom;