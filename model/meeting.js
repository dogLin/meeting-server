const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const IPv4 = require('../utils/os')

const ObjectId = Schema.Types.ObjectId;

const MeetingSchema = new Schema({
    name: { type: String },
    meetingRoom: {
        type: ObjectId,
        ref: "MeetingRoom"
    },
    desc: { type: String },
    startTime: {
        type: Date
    },
    endTime: { type: Date },
    issues: [String],
    members: [{
        userId: { type: ObjectId, ref: "User" },
        isStarter: {type: Boolean},
        isHelper: {type: Boolean},
        isJoin: {type: Boolean},
        isSign: {type: Boolean},
        signTime: {type: Date},
        device: {type: ObjectId, ref: "Device"}
    }],
    tasks: [{

    }], //任务暂定 分定时任务和指定人员任务
    files:[{
        name: {type: String},
        url: {type: String}
    }],
    status:{
        type: String,
        enum: ["预约","进行中","未进行", "已结束", "已取消"]
    },
    votes:[{
        name: {type: String},
        status: {
            type: String,
            enum: ["进行中", "已结束"],
            default: '进行中'
        },
        options: [
            {
                caption: {type: String},
                count: {type: Number,default: 0},
                message: {type: String},
                voter: [
                    {
                        user:{ type: ObjectId, ref: "User" },
                        info: {type: String},
                    }
                ]
            }
        ]
    }],
    minutes: String
})

MeetingSchema.post('find', function(result) {
  // prints number of milliseconds the query took
  console.log('find() took ' + (Date.now() - this.start) + ' millis');
  let port = process.env.PORT || '3000'
  result.map(meeting => {
      if(meeting.files.length>0){
          meeting.files.map(file=>{
              file.url = file.url ? 'http://' + IPv4.address + ':' + port + '/' + file.url : ''
          })
          
      }

      if(meeting.members.length>0){
        meeting.members.map(mem=>{
            if (mem.userId.avatar && mem.userId.avatar.indexOf("http://") !== 0 ){
                mem.userId.avatar = mem.userId ? 'http://' + IPv4.address + ':' + port + '/' + mem.userId.avatar : ''
            }
        })
      }
  })
});


const Meeting = mongoose.model("Meeting", MeetingSchema);
module.exports = Meeting;